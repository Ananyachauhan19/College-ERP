const mongoose = require('mongoose');
const { PAYMENT_FREQUENCIES } = require('../config/constants');

const feeHeadItemSchema = new mongoose.Schema({
  headName: {
    type: String,
    required: true,
    trim: true, // e.g. "Tuition Fee", "Admission Fee", "Examination Fee", "Library & Lab Fee"
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  isRefundable: {
    type: Boolean,
    default: false,
  },
});

const feeStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
    feeHeads: [feeHeadItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultFrequency: {
      type: String,
      enum: Object.values(PAYMENT_FREQUENCIES),
      default: PAYMENT_FREQUENCIES.SEMESTER,
    },
    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
