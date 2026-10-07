const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    name: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
    },
    url: String,
    headers: [{
      key: String,
      value: String
    }],
    params: [{
      key: String,
      value: String
    }],
    body: String,
    bodyType: String,
    auth: {
      type: String,
      username: String,
      password: String,
      token: String,
      apiKey: String
    }
  },
  response: {
    status: Number,
    statusText: String,
    headers: mongoose.Schema.Types.Mixed,
    data: mongoose.Schema.Types.Mixed,
    time: Number,
    size: Number
  },
  error: {
    message: String,
    code: String
  },
  environment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Environment'
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

historySchema.index({ user: 1, createdAt: -1 });
historySchema.index({ user: 1, 'request.url': 1 });

module.exports = mongoose.model('History', historySchema);