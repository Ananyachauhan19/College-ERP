const mongoose = require('mongoose');
const { PAYROLL_STATUS, SALARY_CALCULATION_TYPES } = require('../config/constants');

const payrollSchema = new mongoose.Schema(
  {
    payrollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    payrollMonth: {
      type: String, // e.g. "2026-10"
      required: true,
      trim: true,
    },
    calculationType: {
      type: String,
      enum: Object.values(SALARY_CALCULATION_TYPES),
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyRate: {
      type: Number,
      default: 0,
    },
    workingDaysInMonth: {
      type: Number,
      required: true,
      default: 30,
    },
    paidLeavesCount: {
      type: Number,
      default: 0,
    },
    unpaidLeavesCount: {
      type: Number,
      default: 0,
    },
    leaveDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    deductionReason: {
      type: String,
      trim: true,
    },
    allowances: {
      type: Number,
      default: 0,
      min: 0,
    },
    statutoryDeductions: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPayable: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYROLL_STATUS),
      default: PAYROLL_STATUS.DRAFT,
      index: true,
    },
    paymentDate: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Prevent duplicate payroll for the same teacher and month
payrollSchema.index({ teacherId: 1, payrollMonth: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
