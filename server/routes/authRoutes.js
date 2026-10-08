const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

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

    const hashedPassword = await bcrypt.hash(password, 10);
    // If first user, make admin, otherwise standard user
    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 ? 'admin' : 'user';

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
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

// POST /api/auth/2fa/verify-login - Complete 2FA login with code
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

    if (!user.twoFactorTempCode || user.twoFactorTempCode !== code.toString().trim()) {
      return res.status(400).json({ message: 'Invalid 2FA verification code. Please check and try again.' });
    }

    if (!user.twoFactorTempExpiry || new Date(user.twoFactorTempExpiry) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please log in again.' });
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

// POST /api/auth/2fa/generate - Generate 2FA setup secret and code
router.post('/2fa/generate', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const setupCode = Math.floor(100000 + Math.random() * 900000).toString();
    const secretKey = 'SEC-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

    user.twoFactorSecret = secretKey;
    user.twoFactorTempCode = setupCode;
    user.twoFactorTempExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.json({
      message: '2FA setup code generated successfully.',
      secret: secretKey,
      code: setupCode,
      setupCode,
      otpauthUrl: `otpauth://totp/APITestingTool:${encodeURIComponent(user.email)}?secret=${secretKey}&issuer=APITestingTool`,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate 2FA setup', error: error.message });
  }
});

// POST /api/auth/2fa/enable - Confirm code and enable 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.twoFactorTempCode || user.twoFactorTempCode !== code?.toString().trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please enter the correct 6-digit code.' });
    }

    if (!user.twoFactorTempExpiry || new Date(user.twoFactorTempExpiry) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please generate a new code.' });
    }

    user.twoFactorEnabled = true;
    user.twoFactorTempCode = '';
    user.twoFactorTempExpiry = null;
    await user.save();

    res.json({
      message: 'Two-factor authentication (2FA) is now enabled for your account!',
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
      message: 'Two-factor authentication (2FA) has been disabled.',
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

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    const ADMIN_EMAILS = ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com', 'admin@apitester.io'];
    const isAdmin = ADMIN_EMAILS.includes(cleanEmail);

    if (user) {
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }
      user.lastLogin = new Date();
      if (photoURL && !user.photoURL) user.photoURL = photoURL;
      if (googleId && !user.googleId) user.googleId = googleId;
      if (isAdmin && user.role !== 'admin') user.role = 'admin';
      await user.save();
    } else {
      const totalUsers = await User.countDocuments();
      const role = isAdmin || totalUsers === 0 ? 'admin' : 'user';

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

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No registered user found with that email address.' });
    }

    // Generate 6-digit OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = resetCode;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    res.json({
      message: `Verification reset code generated! Enter code ${resetCode} to complete password reset.`,
      resetCode,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: 'Forgot password request failed', error: error.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: 'Email, reset code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.resetToken || user.resetToken !== resetCode.trim()) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = '';
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully! You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

