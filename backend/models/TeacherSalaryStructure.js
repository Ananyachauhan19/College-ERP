const mongoose = require('mongoose');
const { SALARY_CALCULATION_TYPES } = require('../config/constants');

const teacherSalaryStructureSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      unique: true,
      index: true,
    },
    calculationType: {
      type: String,
      enum: Object.values(SALARY_CALCULATION_TYPES),
      required: true,
      default: SALARY_CALCULATION_TYPES.MONTHLY,
    },
    baseMonthlySalary: {
      type: Number,
      required: true,
      min: 0,
      default: 50000,
    },
    dailyRate: {
      type: Number,
      default: 2000,
      min: 0,
    },
    paidLeavesAllowedPerMonth: {
      type: Number,
      default: 2,
      min: 0,
    },
    hra: {
      type: Number,
      default: 5000,
      min: 0,
    },
    allowances: {
      type: Number,
      default: 3000,
      min: 0,
    },
    standardDeductions: {
      type: Number,
      default: 1000,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TeacherSalaryStructure', teacherSalaryStructureSchema);
