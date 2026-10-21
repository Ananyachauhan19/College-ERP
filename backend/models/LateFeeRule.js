const mongoose = require('mongoose');

const lateFeeRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    graceDays: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
    },
    fineType: {
      type: String,
      enum: ['fixed', 'percentage', 'daily'],
      default: 'fixed',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxLimit: {
      type: Number,
      default: 5000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LateFeeRule', lateFeeRuleSchema);
