const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Course');
const StudentFeeSchedule = require('../models/StudentFeeSchedule');
const FeeLedger = require('../models/FeeLedger');
const AuditLog = require('../models/AuditLog');
const { generateFeeSchedulePeriods } = require('../services/feeSchedulerService');
const { sendAdmissionConfirmation } = require('../services/emailService');
const { ROLES } = require('../config/constants');

exports.createAdmission = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      address,
      departmentId,
      courseId,
      academicYear,
      courseDurationYears,
      totalCourseFee,
      paymentFrequency,
      scholarshipName,
      scholarshipAmount,
    } = req.body;

    if (!name || !email || !phone || !courseId || !departmentId || !totalCourseFee) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, course, department, and total course fee are required.',
      });
    }

    // Check for existing user or student with email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A student or user with this email address is already registered.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course not found.' });
    }

    // Generate unique Admission Number
    const yearPrefix = academicYear ? academicYear.split('-')[0] : new Date().getFullYear();
    const count = await Student.countDocuments();
    const admissionNo = `ADM-${yearPrefix}-${String(count + 1).padStart(4, '0')}`;

    // Default password for student portal
    const defaultPassword = `Student@${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create User account
    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password: defaultPassword,
      role: ROLES.STUDENT,
      phone,
      isActive: true,
      profileModel: 'Student',
    });
    await newUser.save();

    // 2. Create Student profile
    const numDurationYears = Number(courseDurationYears) || course.durationYears;
    const numTotalFee = Number(totalCourseFee);
    const numScholarship = Number(scholarshipAmount) || 0;

    const student = new Student({
      admissionNo,
      userId: newUser._id,
      name,
      email: newUser.email,
      phone,
      dateOfBirth: dateOfBirth || null,
      address,
      departmentId,
      courseId,
      academicYear: academicYear || '2026-2027',
      courseDurationYears: numDurationYears,
      totalCourseFee: numTotalFee,
      paymentFrequency: paymentFrequency || 'semester',
      scholarshipConcession: {
        name: scholarshipName || 'Standard Admission',
        amount: numScholarship,
      },
    });
    await student.save();

    // Link student profile to user
    newUser.profileId = student._id;
    await newUser.save();

    // 3. Generate Fee Schedule periods
    const periods = generateFeeSchedulePeriods({
      durationYears: numDurationYears,
      totalCourseFee: numTotalFee,
      paymentFrequency: student.paymentFrequency,
      startDate: new Date(),
      scholarshipAmount: numScholarship,
    });

    const netPayable = Math.max(0, numTotalFee - numScholarship);

    const feeSchedule = new StudentFeeSchedule({
      studentId: student._id,
      courseId,
      academicYear: student.academicYear,
      paymentFrequency: student.paymentFrequency,
      totalCourseFee: numTotalFee,
      totalScholarship: numScholarship,
      netPayable,
      totalPaid: 0,
      balanceDue: netPayable,
      periods,
    });
    await feeSchedule.save();

    // Link schedule back to student
    student.feeScheduleRef = feeSchedule._id;
    await student.save();

    // 4. Initial Fee Ledger Entry (Debit total net fee)
    await FeeLedger.create({
      studentId: student._id,
      entryType: 'DEBIT',
      amount: netPayable,
      runningBalance: netPayable,
      description: `Initial Course Fee assessment for ${course.name} (${student.paymentFrequency})`,
      recordedBy: req.user._id,
    });

    // 5. Send Admission Confirmation Email asynchronously
    sendAdmissionConfirmation({
      student,
      courseName: course.name,
      defaultPassword,
    }).catch((e) => console.error('[Email Service Async]', e.message));

    // 6. Record Audit Log
    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'CREATE_ADMISSION',
      module: 'ADMISSION',
      recordId: student._id.toString(),
      details: {
        admissionNo,
        studentName: student.name,
        course: course.name,
        totalFee: numTotalFee,
        frequency: student.paymentFrequency,
      },
    });

    res.status(201).json({
      success: true,
      message: `Admission created successfully with Admission No: ${admissionNo}`,
      student,
      feeSchedule,
      tempPassword: defaultPassword,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const { departmentId, courseId, academicYear, search, status } = req.query;
    const query = {};

    if (departmentId) query.departmentId = departmentId;
    if (courseId) query.courseId = courseId;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.admissionStatus = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { admissionNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code durationYears')
      .populate('feeScheduleRef')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    next(err);
  }
};

exports.getAdmissionById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('departmentId')
      .populate('courseId')
      .populate('feeScheduleRef');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    res.json({ success: true, student });
  } catch (err) {
    next(err);
  }
};

exports.updateAdmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone, address, admissionStatus, updateReason } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const previousState = {
      phone: student.phone,
      address: student.address,
      status: student.admissionStatus,
    };

    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (admissionStatus) student.admissionStatus = admissionStatus;

    await student.save();

    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'UPDATE_ADMISSION',
      module: 'ADMISSION',
      recordId: student._id.toString(),
      details: {
        reason: updateReason || 'Administrative update',
        previousState,
        newState: { phone: student.phone, address: student.address, status: student.admissionStatus },
      },
    });

    res.json({
      success: true,
      message: 'Student record updated successfully.',
      student,
    });
  } catch (err) {
    next(err);
  }
};
