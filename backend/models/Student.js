const mongoose = require('mongoose');
const { PAYMENT_FREQUENCIES } = require('../config/constants');

const studentSchema = new mongoose.Schema(
  {
    admissionNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
      default: '2026-2027',
    },
    courseDurationYears: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    totalCourseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentFrequency: {
      type: String,
      enum: Object.values(PAYMENT_FREQUENCIES),
      required: true,
      default: PAYMENT_FREQUENCIES.SEMESTER,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    admissionStatus: {
      type: String,
      enum: ['active', 'graduated', 'suspended', 'cancelled'],
      default: 'active',
    },
    scholarshipConcession: {
      name: String,
      amount: { type: Number, default: 0 },
      remarks: String,
    },
    feeScheduleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentFeeSchedule',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
