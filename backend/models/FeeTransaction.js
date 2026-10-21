const mongoose = require('mongoose');
const { PAYMENT_MODES } = require('../config/constants');

const feeTransactionSchema = new mongoose.Schema(
  {
    transactionNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    schedulePeriodId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
    },
    periodName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentMode: {
      type: String,
      enum: Object.values(PAYMENT_MODES),
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success',
      index: true,
    },
    referenceNo: {
      type: String,
      trim: true, // Cheque number, Bank UTR, or Gateway Payment ID
    },
    gatewayOrderId: {
      type: String,
      trim: true,
    },
    gatewaySignature: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    receiptRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt',
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeeTransaction', feeTransactionSchema);
