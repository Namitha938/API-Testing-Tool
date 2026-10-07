const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String },
    passed: { type: Boolean, required: true },
    expected: { type: String },
    actual: { type: String },
    error: { type: String },
  },
  { _id: false }
);

const timingSchema = new mongoose.Schema(
  {
    dns: { type: Number, default: 0 },
    tcp: { type: Number, default: 0 },
    ttfb: { type: Number, default: 0 },
    download: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const requestHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      required: false,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavedRequest',
      default: null,
    },
    method: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    statusText: {
      type: String,
      default: '',
    },
    responseTime: {
      type: Number,
      default: 0,
    },
    responseSize: {
      type: Number,
      default: 0,
    },
    timings: timingSchema,
    requestHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    requestBody: {
      type: String,
      default: '',
    },
    responseHeaders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    responseBody: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      default: 'application/json',
    },
    testResults: [testResultSchema],
    passedCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast query of recent user history
requestHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RequestHistory', requestHistorySchema);

