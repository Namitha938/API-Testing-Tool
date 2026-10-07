const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const environmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
    variables: [variableSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Environment', environmentSchema);

