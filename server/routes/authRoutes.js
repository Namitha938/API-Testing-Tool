const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const { sendPasswordResetOtp } = require('../services/emailService');
const {
  encrypt,
  decrypt,
  generateRecoveryCodes,
  hashRecoveryCode,
} = require('../utils/cryptoHelper');

// Rate limiting check helper
const check2FaRateLimit = (user, res) => {
  if (user.twoFactorLockUntil && new Date(user.twoFactorLockUntil) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(user.twoFactorLockUntil) - new Date()) / 60000);
    res.status(429).json({
      message: `Too many failed 2FA verification attempts. Account 2FA is temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
      locked: true,
      remainingMinutes,
    });
    return true;
  }
  return false;
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    const ALLOWED_ADMIN_EMAILS = ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com'];
    const cleanEmail = email.toLowerCase().trim();
    const role = ALLOWED_ADMIN_EMAILS.includes(cleanEmail) ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: newUser.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled) {
      if (check2FaRateLimit(user, res)) return;

      // Issue a cryptographically signed, short-lived 2FA ticket (5 minutes validity)
      const twoFactorTicket = jwt.sign(
        { id: user._id, email: user.email, purpose: '2fa_login' },
        JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        requires2FA: true,
        email: user.email,
        twoFactorTicket,
        message: 'Two-factor authentication is required. Please enter the 6-digit code from your authenticator app.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// POST /api/auth/2fa/verify-login - Complete 2FA login with 6-digit TOTP code or Backup Recovery Code
router.post('/2fa/verify-login', async (req, res) => {
  try {
    const { email, code, twoFactorTicket } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code or recovery code is required.' });
    }

    let user = null;

    // Prefer verifying the signed short-lived 2FA ticket
    if (twoFactorTicket) {
      try {
        const decoded = jwt.verify(twoFactorTicket, JWT_SECRET);
        if (decoded.purpose === '2fa_login' && decoded.id) {
          user = await User.findById(decoded.id);
        }
      } catch (ticketErr) {
        // Ticket expired or tampered
        return res.status(400).json({
          message: '2FA login session has expired. Please enter your email and password again.',
        });
      }
    }

    // Fallback to email if ticket wasn't supplied
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found or session invalid.' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is not active on this account.' });
    }

    // Check rate-limiting / temporary account lock
    if (check2FaRateLimit(user, res)) return;

    const cleanCode = code.toString().trim();
    let isValid = false;
    let isRecoveryCode = false;

    // 1. Try TOTP code from Authenticator App (Google Authenticator / Microsoft Authenticator / Authy)
    const secret = decrypt(user.twoFactorSecret);
    if (secret && /^\d{6}$/.test(cleanCode)) {
      const currentStep = Math.floor(Date.now() / 1000 / 30);
      const delta = speakeasy.totp.verifyDelta({
        secret,
        encoding: 'base32',
        token: cleanCode,
        window: 1, // ±30s clock drift
      });

      if (delta) {
        const usedStep = currentStep + delta.delta;
        // Replay attack prevention: reject if this exact 30s timestep was already used
        if (user.twoFactorLastTimestep && user.twoFactorLastTimestep === usedStep) {
          return res.status(400).json({
            message: 'This security code was already used. Please wait a moment for your authenticator app to show a fresh code.',
          });
        }
        user.twoFactorLastTimestep = usedStep;
        isValid = true;
      }
    }

    // 2. Try Backup Recovery Code if not validated as TOTP
    if (!isValid && Array.isArray(user.twoFactorRecoveryCodes) && user.twoFactorRecoveryCodes.length > 0) {
      const inputHash = hashRecoveryCode(cleanCode);
      const matchIndex = user.twoFactorRecoveryCodes.findIndex(
        (rc) => rc.hash === inputHash && !rc.used
      );

      if (matchIndex !== -1) {
        user.twoFactorRecoveryCodes[matchIndex].used = true;
        user.twoFactorRecoveryCodes[matchIndex].usedAt = new Date();
        isValid = true;
        isRecoveryCode = true;
      }
    }

    if (!isValid) {
      user.twoFactorFailedAttempts = (user.twoFactorFailedAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      if (user.twoFactorFailedAttempts >= MAX_ATTEMPTS) {
        user.twoFactorLockUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 minutes
        await user.save();
        return res.status(429).json({
          message: 'Too many incorrect verification attempts. Account 2FA is locked for 10 minutes.',
          locked: true,
        });
      }
      await user.save();
      const remaining = MAX_ATTEMPTS - user.twoFactorFailedAttempts;
      return res.status(400).json({
        message: `Invalid 6-digit code or recovery code (${remaining} attempt${remaining === 1 ? '' : 's'} remaining).`,
      });
    }

    // Reset rate-limiting counters on successful verification
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    user.twoFactorTempCode = '';
    user.twoFactorTempExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: isRecoveryCode
        ? 'Signed in successfully using backup recovery code!'
        : 'Two-factor authentication verified successfully!',
      token,
      user: user.toJSON(),
      usedRecoveryCode: isRecoveryCode,
      remainingRecoveryCodes: user.twoFactorRecoveryCodes.filter((c) => !c.used).length,
    });
  } catch (error) {
    res.status(500).json({ message: '2FA login verification failed', error: error.message });
  }
});

// POST /api/auth/2fa/generate - Generate TOTP secret and Scannable QR Code
router.post('/2fa/generate', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate unique Base32 secret for Google Authenticator / Microsoft Authenticator / Authy
    const secret = speakeasy.generateSecret({
      name: `APITester Studio (${user.email})`,
      issuer: 'APITester Studio',
      length: 20,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Encrypt and store temporary setup secret until user confirms verification
    user.twoFactorTempSecret = encrypt(secret.base32);
    user.twoFactorTempExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes window
    await user.save();

    res.json({
      message: 'Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy, or enter the secret key manually.',
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate 2FA setup', error: error.message });
  }
});

// POST /api/auth/2fa/enable - Confirm code from Authenticator App and activate 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: '6-digit verification code is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (check2FaRateLimit(user, res)) return;

    if (!user.twoFactorTempSecret) {
      return res.status(400).json({
        message: 'No pending 2FA setup session found. Please click Enable Two-Factor Authentication to start.',
      });
    }

    if (user.twoFactorTempExpiry && new Date(user.twoFactorTempExpiry) < new Date()) {
      user.twoFactorTempSecret = '';
      user.twoFactorTempExpiry = null;
      await user.save();
      return res.status(400).json({
        message: '2FA setup session has expired. Please restart the 2FA setup.',
      });
    }

    const plainSecret = decrypt(user.twoFactorTempSecret);
    const cleanCode = code.toString().trim();

    const currentStep = Math.floor(Date.now() / 1000 / 30);
    const delta = speakeasy.totp.verifyDelta({
      secret: plainSecret,
      encoding: 'base32',
      token: cleanCode,
      window: 1, // ±30s clock drift
    });

    if (!delta) {
      user.twoFactorFailedAttempts = (user.twoFactorFailedAttempts || 0) + 1;
      if (user.twoFactorFailedAttempts >= 5) {
        user.twoFactorLockUntil = new Date(Date.now() + 10 * 60 * 1000);
      }
      await user.save();
      return res.status(400).json({
        message: 'Invalid 6-digit code. Please enter the current code shown in your authenticator app and check that your device clock is synchronized.',
      });
    }

    // Generate 8 secure backup recovery codes
    const plainRecoveryCodes = generateRecoveryCodes(8);
    user.twoFactorRecoveryCodes = plainRecoveryCodes.map((c) => ({
      hash: hashRecoveryCode(c),
      used: false,
      usedAt: null,
    }));

    // Activate 2FA and encrypt secret at rest
    user.twoFactorSecret = user.twoFactorTempSecret; // Already encrypted
    user.twoFactorTempSecret = '';
    user.twoFactorTempExpiry = null;
    user.twoFactorEnabled = true;
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    user.twoFactorLastTimestep = currentStep + delta.delta;
    await user.save();

    res.json({
      message: 'Two-factor authentication is now active! Please copy and securely store your backup recovery codes.',
      user: user.toJSON(),
      recoveryCodes: plainRecoveryCodes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to enable 2FA', error: error.message });
  }
});

// POST /api/auth/2fa/disable - Disable 2FA with identity verification (current password or TOTP code)
router.post('/2fa/disable', authenticate, async (req, res) => {
  try {
    const { password, code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: 'Two-factor authentication is already disabled.' });
    }

    let identityVerified = false;

    // Verify via account password
    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) identityVerified = true;
    }

    // Verify via active 6-digit TOTP code
    if (!identityVerified && code && user.twoFactorSecret) {
      const plainSecret = decrypt(user.twoFactorSecret);
      const cleanCode = code.toString().trim();
      const totpValid = speakeasy.totp.verify({
        secret: plainSecret,
        encoding: 'base32',
        token: cleanCode,
        window: 1,
      });
      if (totpValid) identityVerified = true;
    }

    if (!identityVerified) {
      return res.status(400).json({
        message: 'Identity verification failed. Please enter your account password or current 6-digit authenticator code to disable 2FA.',
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    user.twoFactorTempSecret = '';
    user.twoFactorTempExpiry = null;
    user.twoFactorRecoveryCodes = [];
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    await user.save();

    res.json({
      message: 'Two-factor authentication (2FA) has been successfully disabled.',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
});

// POST /api/auth/2fa/recovery-codes - Generate fresh backup recovery codes
router.post('/2fa/recovery-codes', authenticate, async (req, res) => {
  try {
    const { password, code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA must be active to generate recovery codes.' });
    }

    let identityVerified = false;
    if (password && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) identityVerified = true;
    }
    if (!identityVerified && code && user.twoFactorSecret) {
      const plainSecret = decrypt(user.twoFactorSecret);
      const totpValid = speakeasy.totp.verify({
        secret: plainSecret,
        encoding: 'base32',
        token: code.toString().trim(),
        window: 1,
      });
      if (totpValid) identityVerified = true;
    }

    if (!identityVerified) {
      return res.status(400).json({
        message: 'Please provide your account password or current authenticator code to generate new recovery codes.',
      });
    }

    const plainRecoveryCodes = generateRecoveryCodes(8);
    user.twoFactorRecoveryCodes = plainRecoveryCodes.map((c) => ({
      hash: hashRecoveryCode(c),
      used: false,
      usedAt: null,
    }));
    await user.save();

    res.json({
      message: 'New recovery codes generated successfully. Store them in a safe place.',
      recoveryCodes: plainRecoveryCodes,
      remainingRecoveryCodes: 8,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate recovery codes', error: error.message });
  }
});

// GET /api/auth/2fa/status - Get current 2FA status and count of unused recovery codes
router.get('/2fa/status', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const recoveryCodes = Array.isArray(user.twoFactorRecoveryCodes) ? user.twoFactorRecoveryCodes : [];
    res.json({
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      remainingRecoveryCodes: recoveryCodes.filter((c) => !c.used).length,
      totalRecoveryCodes: recoveryCodes.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch 2FA status', error: error.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { name, email, photoURL, googleId } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required for Google authentication.' });
    }

    const cleanEmail = email.toLowerCase().replace(/\s+/g, '').trim();
    let user = await User.findOne({ email: cleanEmail });

    const ADMIN_EMAILS = [
      'singunamitha@gmail.com',
      's.v.padmavathi2005@gmail.com',
    ];
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

    if (user) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }
      user.lastLogin = new Date();
      if (photoURL && !user.photoURL) user.photoURL = photoURL;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (isAdmin) {
        user.role = 'admin';
      } else {
        user.role = 'user';
      }
      await user.save();
    } else {
      const role = isAdmin ? 'admin' : 'user';

      user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        photoURL: photoURL || '',
        googleId: googleId || 'google_' + Date.now(),
        role,
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Google authentication successful!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, photoURL, bio, company, githubUsername } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name;
    if (photoURL !== undefined) user.photoURL = photoURL;
    if (bio !== undefined) user.bio = bio;
    if (company !== undefined) user.company = company;
    if (githubUsername !== undefined) user.githubUsername = githubUsername;

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Profile update failed', error: error.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

// POST /api/auth/forgot-password - Request email OTP verification code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email: cleanEmail });

    // Rate-limiting check: enforce 60-second cooldown per account
    if (user && user.resetTokenLastSent) {
      const elapsedMs = Date.now() - new Date(user.resetTokenLastSent).getTime();
      const COOLDOWN_MS = 60 * 1000;
      if (elapsedMs < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsedMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSec} seconds before requesting another verification code.`,
          cooldownRemaining: remainingSec,
        });
      }
    }

    // Generic response message to prevent account enumeration
    const genericSuccessMessage =
      'If an account exists with that email address, a 6-digit verification code has been sent. Please check your inbox and spam folder.';

    if (!user) {
      // Small simulated delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 300));
      return res.json({
        success: true,
        message: genericSuccessMessage,
        cooldown: 60,
      });
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();

    // Never store plaintext OTPs: hash OTP using SHA-256 before persisting
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');

    user.resetToken = hashedOtp;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    user.resetTokenAttempts = 0;
    user.resetTokenLastSent = new Date();
    user.resetVerified = false;
    await user.save();

    // Send verification email
    let emailResult = { isLiveSmtp: false, previewUrl: null };
    try {
      emailResult = await sendPasswordResetOtp({
        to: user.email,
        otp: rawOtp,
        name: user.name || 'Developer',
      });
    } catch (emailErr) {
      console.error('[Auth Service] Email delivery failure:', emailErr.message);
      emailResult = { isLiveSmtp: false, previewUrl: null, error: emailErr.message };
    }

    const actuallySentLive = Boolean(emailResult && emailResult.isLiveSmtp);

    const responsePayload = {
      success: true,
      message: genericSuccessMessage,
      cooldown: 60,
      previewUrl: emailResult.previewUrl || null,
      isLiveSmtp: actuallySentLive,
    };

    // If live email was not successfully dispatched to inbox, supply devCode fallback
    if (!actuallySentLive) {
      responsePayload.devCode = rawOtp;
    }

    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ message: 'Forgot password request failed', error: error.message });
  }
});

// POST /api/auth/verify-reset-code - Verify the 6-digit email OTP
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email address and verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return res.status(400).json({ message: 'Verification code must be exactly 6 digits.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.resetToken) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Check token expiry (10 minutes)
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      user.resetToken = '';
      user.resetTokenExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    // Brute-force protection: max 5 failed attempts per OTP
    if (user.resetTokenAttempts >= 5) {
      user.resetToken = '';
      user.resetTokenExpiry = null;
      await user.save();
      return res.status(429).json({
        message: 'Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.',
      });
    }

    // Validate OTP hash
    const inputHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
    if (inputHash !== user.resetToken) {
      user.resetTokenAttempts = (user.resetTokenAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.resetTokenAttempts;
      return res.status(400).json({
        message: `Invalid verification code. Please check your email (${remaining} attempt${remaining === 1 ? '' : 's'} remaining).`,
      });
    }

    // Mark as verified and generate short-lived Reset Ticket (valid for 15 minutes)
    user.resetVerified = true;
    await user.save();

    const resetTicket = jwt.sign(
      { id: user._id, email: user.email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Verification code confirmed successfully!',
      resetTicket,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify code', error: error.message });
  }
});

// POST /api/auth/reset-password - Set new password after OTP verification
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, resetTicket, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ message: 'Password reset failed. Invalid request.' });
    }

    let isAuthorized = false;

    // Method 1: Check signed Reset Ticket with single-use flag
    if (resetTicket) {
      try {
        const decoded = jwt.verify(resetTicket, JWT_SECRET);
        if (decoded.id === user._id.toString() && decoded.purpose === 'password_reset') {
          if (user.resetVerified) {
            isAuthorized = true;
          }
        }
      } catch (jwtErr) {
        // Ticket invalid or expired
      }
    }

    // Method 2: Fallback to verified OTP within expiry window
    if (!isAuthorized && code && user.resetToken) {
      const inputHash = crypto.createHash('sha256').update(code.toString().trim()).digest('hex');
      if (
        inputHash === user.resetToken &&
        user.resetTokenExpiry &&
        new Date(user.resetTokenExpiry) >= new Date()
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(400).json({
        message: 'Invalid or expired password reset session. Please request a new verification code.',
      });
    }

    // Hash new password using bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Invalidate OTP, ticket, and reset session completely (single-use enforcement)
    user.resetToken = '';
    user.resetTokenExpiry = null;
    user.resetTokenAttempts = 0;
    user.resetVerified = false;
    user.twoFactorFailedAttempts = 0;
    user.twoFactorLockUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'Your password has been reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

