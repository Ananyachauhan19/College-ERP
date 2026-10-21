const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'fixed',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    approvedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    appliedPeriodNumber: {
      type: Number, // null indicates evenly distributed across all remaining periods
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    reason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);
