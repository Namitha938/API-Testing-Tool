const mongoose = require('mongoose');

const assertionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'statusCode',
      'responseTime',
      'responseBodyContains',
      'responseBodyEquals',
      'responseHeaderExists',
      'responseHeaderEquals',
      'jsonPath',
      'xpath',
      'schema'
    ],
    required: true
  },
  target: String,
  expected: mongoose.Schema.Types.Mixed,
  operator: {
    type: String,
    enum: ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'lessThan', 'matches', 'exists', 'notExists'],
    default: 'equals'
  },
  description: String,
  isEnabled: {
    type: Boolean,
    default: true
  }
});

const testCaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  request: {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    headers: [{
      key: String,
      value: String
    }],
    params: [{
      key: String,
      value: String
    }],
    body: String,
    bodyType: {
      type: String,
      enum: ['json', 'form', 'raw', 'xml'],
      default: 'json'
    },
    auth: {
      type: {
        type: String,
        enum: ['none', 'basic', 'bearer', 'apikey'],
        default: 'none'
      },
      username: String,
      password: String,
      token: String,
      apiKey: String
    }
  },
  assertions: [assertionSchema],
  environment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Environment'
  },
  setupScript: String,
  teardownScript: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  lastStatus: {
    type: String,
    enum: ['passed', 'failed', 'running', 'never'],
    default: 'never'
  },
  runCount: {
    type: Number,
    default: 0
  },
  passCount: {
    type: Number,
    default: 0
  },
  failCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

testCaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const testRunSchema = new mongoose.Schema({
  testCase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'running'],
    required: true
  },
  duration: Number,
  assertions: [{
    assertion: assertionSchema,
    result: {
      type: String,
      enum: ['passed', 'failed']
    },
    actual: mongoose.Schema.Types.Mixed,
    expected: mongoose.Schema.Types.Mixed,
    message: String
  }],
  request: {
    method: String,
    url: String,
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed
  },
  response: {
    status: Number,
    statusText: String,
    headers: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed,
    time: Number
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

testRunSchema.index({ testCase: 1, createdAt: -1 });
testRunSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('TestCase', testCaseSchema);
module.exports.TestRun = mongoose.model('TestRun', testRunSchema);