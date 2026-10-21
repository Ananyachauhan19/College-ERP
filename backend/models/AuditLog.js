const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g., 'CREATE_ADMISSION', 'COLLECT_FEE', 'WAIVE_FINE', 'APPROVE_LEAVE', 'GENERATE_PAYROLL'
      index: true,
    },
    module: {
      type: String,
      required: true, // 'ADMISSION', 'FEE', 'LEAVE', 'PAYROLL', 'USER'
      index: true,
    },
    recordId: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
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

module.exports = mongoose.model('AuditLog', auditLogSchema);
