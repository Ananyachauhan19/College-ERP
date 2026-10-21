const mongoose = require('mongoose');
const { PAYMENT_FREQUENCIES, FEE_STATUS } = require('../config/constants');

const periodScheduleSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true,
  },
  periodName: {
    type: String,
    required: true, // e.g. "Semester 1" or "Year 1" or "Installment 1"
  },
  dueDate: {
    type: Date,
    required: true,
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  scholarshipDeduction: {
    type: Number,
    default: 0,
    min: 0,
  },
  lateFeeApplied: {
    type: Number,
    default: 0,
    min: 0,
  },
  netDue: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(FEE_STATUS),
    default: FEE_STATUS.PENDING,
  },
});

const studentFeeScheduleSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    paymentFrequency: {
      type: String,
      enum: Object.values(PAYMENT_FREQUENCIES),
      required: true,
    },
    totalCourseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    totalScholarship: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPayable: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
      min: 0,
    },
    periods: [periodScheduleSchema],
  },
  {
    timestamps: true,
  }
);

// Helper method to recalculate totals
studentFeeScheduleSchema.methods.recalculateTotals = function () {
  let paidSum = 0;
  let balanceSum = 0;
  let scholarshipSum = 0;

  this.periods.forEach((period) => {
    scholarshipSum += period.scholarshipDeduction || 0;
    paidSum += period.amountPaid || 0;
    balanceSum += period.balance || 0;
  });

  this.totalScholarship = scholarshipSum;
  this.netPayable = Math.max(0, this.totalCourseFee - this.totalScholarship);
  this.totalPaid = paidSum;
  this.balanceDue = balanceSum;
};

module.exports = mongoose.model('StudentFeeSchedule', studentFeeScheduleSchema);
