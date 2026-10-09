const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    photoURL: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    githubUsername: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: '',
    },
    resetToken: {
      type: String,
      default: '',
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    resetTokenAttempts: {
      type: Number,
      default: 0,
    },
    resetTokenLastSent: {
      type: Date,
      default: null,
    },
    resetVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: '',
    },
    twoFactorTempSecret: {
      type: String,
      default: '',
    },
    twoFactorTempExpiry: {
      type: Date,
      default: null,
    },
    twoFactorRecoveryCodes: [
      {
        hash: { type: String, required: true },
        used: { type: Boolean, default: false },
        usedAt: { type: Date, default: null },
      },
    ],
    twoFactorLastTimestep: {
      type: Number,
      default: -1,
    },
    twoFactorFailedAttempts: {
      type: Number,
      default: 0,
    },
    twoFactorLockUntil: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  const recoveryCodes = Array.isArray(obj.twoFactorRecoveryCodes) ? obj.twoFactorRecoveryCodes : [];
  obj.remainingRecoveryCodes = recoveryCodes.filter((c) => !c.used).length;
  delete obj.password;
  delete obj.twoFactorSecret;
  delete obj.twoFactorTempSecret;
  delete obj.twoFactorRecoveryCodes;
  delete obj.twoFactorTempCode;
  delete obj.resetToken;
  delete obj.resetTokenAttempts;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

