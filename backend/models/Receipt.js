const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    invoiceNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeTransaction',
      required: true,
    },
    periodName: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    previousBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMode: {
      type: String,
      required: true,
    },
    referenceNo: {
      type: String,
      trim: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['valid', 'cancelled'],
      default: 'valid',
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

module.exports = mongoose.model('Receipt', receiptSchema);
