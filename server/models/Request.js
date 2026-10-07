const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
  },
  url: {
    type: String,
    required: true
  },
  headers: {
    type: [
      {
        key: String,
        value: String,
        enabled: { type: Boolean, default: true },
        description: String
      }
    ],
    default: []
  },
  params: {
    type: [
      {
        key: String,
        value: String,
        enabled: { type: Boolean, default: true },
        description: String
      }
    ],
    default: []
  },
  body: {
    type: String,
    default: ''
  },
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
    apiKeyName: String,
    apiKey: String,
    apiKeyIn: { type: String, enum: ['header', 'query'], default: 'header' }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
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

requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

requestSchema.index({ user: 1, updatedAt: -1 });
requestSchema.index({ collection: 1 });
requestSchema.index({ folder: 1 });

module.exports = mongoose.model('Request', requestSchema);