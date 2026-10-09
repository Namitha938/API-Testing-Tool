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
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorTempCode = twoFactorCode;
      user.twoFactorTempExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      return res.json({
        requires2FA: true,
        email: user.email,
        message: 'Two-factor authentication is required. A 6-digit verification code has been generated.',
        demoCode: twoFactorCode, // Provided for demonstration and testing convenience
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

// POST /api/auth/2fa/verify-login - Complete 2FA login with code from Authenticator App or SMS/Email
router.post('/2fa/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and 6-digit verification code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cleanCode = code.toString().trim();
    let isValid = false;

    // 1. Verify with Authenticator App (Google Authenticator / Microsoft Authenticator / Authy)
    if (user.twoFactorSecret) {
      const totpValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: cleanCode,
        window: 2, // Allows ±60 seconds clock drift
      });
      if (totpValid) isValid = true;
    }

    // 2. Fallback to temp security code (sent or generated during login session)
    if (!isValid && user.twoFactorTempCode && user.twoFactorTempCode === cleanCode) {
      if (user.twoFactorTempExpiry && new Date(user.twoFactorTempExpiry) >= new Date()) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.status(400).json({
        message: 'Invalid 2FA security code. Please check your Authenticator App or enter the valid code.',
      });
    }

    user.twoFactorTempCode = '';
    user.twoFactorTempExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Two-factor authentication verified successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: '2FA login verification failed', error: error.message });
  }
});

// POST /api/auth/2fa/generate - Generate standard TOTP secret and Scannable QR Code
router.post('/2fa/generate', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Generate standard Base32 secret for Google Authenticator / Microsoft Authenticator
    const secret = speakeasy.generateSecret({
      name: `APITester Studio (${user.email})`,
      issuer: 'APITester Studio',
      length: 20,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save temporary secret until user confirms verification
    user.twoFactorSecret = secret.base32;
    // Also provide a current valid TOTP code so users without a phone can immediately test it
    const currentTotp = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
    });
    user.twoFactorTempCode = currentTotp;
    user.twoFactorTempExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      message: 'Scan the QR code with Google Authenticator, Microsoft Authenticator, or enter the secret key manually.',
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      otpauthUrl: secret.otpauth_url,
      setupCode: currentTotp,
      code: currentTotp,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate 2FA setup', error: error.message });
  }
});

// POST /api/auth/2fa/enable - Confirm code from Authenticator App and activate 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const cleanCode = code ? code.toString().trim() : '';
    let isValid = false;

    // Verify TOTP from Google / Microsoft Authenticator
    if (user.twoFactorSecret) {
      const totpValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: cleanCode,
        window: 2,
      });
      if (totpValid) isValid = true;
    }

    if (!isValid && user.twoFactorTempCode && user.twoFactorTempCode === cleanCode) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({
        message: 'Invalid 6-digit code. Please enter the live code shown in your Authenticator App.',
      });
    }

    user.twoFactorEnabled = true;
    user.twoFactorTempCode = '';
    user.twoFactorTempExpiry = null;
    await user.save();

    res.json({
      message: 'Two-factor authentication is now active! Your account is protected by your Authenticator App.',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to enable 2FA', error: error.message });
  }
});

// POST /api/auth/2fa/disable - Disable 2FA
router.post('/2fa/disable', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    user.twoFactorTempCode = '';
    user.twoFactorTempExpiry = null;
    await user.save();

    res.json({
      message: 'Two-factor authentication (2FA) has been turned off.',
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
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
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
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
      // We still proceed so local/offline setups remain testable
    }

    const responsePayload = {
      success: true,
      message: genericSuccessMessage,
      cooldown: 60,
      previewUrl: emailResult.previewUrl || null,
      isLiveSmtp: Boolean(process.env.SMTP_USER),
    };

    // In local development when SMTP is not configured, supply devCode for instant developer testing
    if (!process.env.SMTP_USER) {
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

    // Method 1: Check signed Reset Ticket
    if (resetTicket) {
      try {
        const decoded = jwt.verify(resetTicket, JWT_SECRET);
        if (decoded.id === user._id.toString() && decoded.purpose === 'password_reset') {
          isAuthorized = true;
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

    // Invalidate OTP and reset session completely (single-use enforcement)
    user.resetToken = '';
    user.resetTokenExpiry = null;
    user.resetTokenAttempts = 0;
    user.resetVerified = false;
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

