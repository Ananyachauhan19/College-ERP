const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
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
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      required: true,
      default: 'Assistant Professor',
    },
    qualification: {
      type: String,
      trim: true,
    },
    dateOfJoining: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    salaryStructureRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherSalaryStructure',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Teacher', teacherSchema);
