const mongoose = require('mongoose');

const feeLedgerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeTransaction',
    },
    entryType: {
      type: String,
      enum: ['DEBIT', 'CREDIT', 'CONCESSION', 'WAIVER', 'ADJUSTMENT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    runningBalance: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FeeLedger', feeLedgerSchema);
