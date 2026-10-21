const mongoose = require('mongoose');
const { LEAVE_STATUS, LEAVE_TYPES } = require('../config/constants');

const leaveRequestSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: Object.values(LEAVE_TYPES),
      required: true,
      default: LEAVE_TYPES.CASUAL,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
      index: true,
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    decisionRemarks: {
      type: String,
      trim: true,
    },
    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
