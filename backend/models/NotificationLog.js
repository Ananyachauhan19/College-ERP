const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true, // 'ADMISSION_CONFIRMATION', 'PAYMENT_RECEIPT', 'LEAVE_DECISION', 'PAYSLIP_GENERATED', etc.
      index: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'simulated'],
      default: 'sent',
    },
    previewUrl: {
      type: String, // Ethereal email preview URL if in test/development mode
    },
    error: {
      type: String,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
