const mongoose = require('mongoose');

const keyValuePairSchema = new mongoose.Schema(
  {
    key: { type: String, default: '' },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    id: { type: String },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['status', 'responseTime', 'jsonProp', 'containsText', 'headerExists'],
      default: 'status',
    },
    expectedValue: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const savedRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: true,
    },
    folderId: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    params: [keyValuePairSchema],
    headers: [keyValuePairSchema],
    auth: {
      type: {
        type: String,
        enum: ['none', 'bearer', 'basic', 'apiKey'],
        default: 'none',
      },
      token: { type: String, default: '' },
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      key: { type: String, default: '' },
      value: { type: String, default: '' },
      addTo: {
        type: String,
        enum: ['header', 'query'],
        default: 'header',
      },
    },
    bodyType: {
      type: String,
      enum: ['none', 'json', 'xml', 'form-data', 'x-www-form-urlencoded', 'raw'],
      default: 'none',
    },
    rawBody: {
      type: String,
      default: '',
    },
    formData: [
      {
        key: { type: String, default: '' },
        value: { type: String, default: '' },
        type: { type: String, enum: ['text', 'file'], default: 'text' },
        enabled: { type: Boolean, default: true },
      },
    ],
    testCases: [testCaseSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedRequest', savedRequestSchema);

