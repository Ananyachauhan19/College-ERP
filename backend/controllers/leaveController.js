const LeaveRequest = require('../models/LeaveRequest');
const Teacher = require('../models/Teacher');
const AuditLog = require('../models/AuditLog');
const { sendLeaveDecisionEmail } = require('../services/emailService');
const { LEAVE_STATUS, LEAVE_TYPES } = require('../config/constants');

// Teacher: Submit Leave Request
exports.applyLeave = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    // Calculate days inclusive
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = new LeaveRequest({
      teacherId: teacher._id,
      leaveType: leaveType || LEAVE_TYPES.CASUAL,
      startDate: start,
      endDate: end,
      totalDays,
      reason,
      status: LEAVE_STATUS.PENDING,
    });
    await leave.save();

    res.status(201).json({
      success: true,
      message: `Leave application for ${totalDays} day(s) submitted successfully.`,
      leave,
    });
  } catch (err) {
    next(err);
  }
};

// Teacher: View My Leaves
exports.getMyLeaves = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const leaves = await LeaveRequest.find({ teacherId: teacher._id })
      .populate('decidedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    next(err);
  }
};

// Super Admin: View All Leaves
exports.getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, teacherId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (teacherId) query.teacherId = teacherId;

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: 'teacherId',
        populate: { path: 'departmentId', select: 'name code' },
      })
      .populate('decidedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, leaves });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Approve or Reject Leave
exports.decideLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, decisionRemarks } = req.body;

    if (![LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Decision status must be either approved or rejected.',
      });
    }

    const leave = await LeaveRequest.findById(id).populate('teacherId');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== LEAVE_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: `This leave request is already marked as ${leave.status}.`,
      });
    }

    leave.status = status;
    leave.decidedBy = req.user._id;
    leave.decisionRemarks = decisionRemarks || '';
    leave.decidedAt = new Date();
    await leave.save();

    // Send email notification to teacher
    sendLeaveDecisionEmail({
      teacher: leave.teacherId,
      leaveRequest: leave,
    }).catch((e) => console.error('[Leave Decision Email Async]', e.message));

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: `DECIDE_LEAVE_${status.toUpperCase()}`,
      module: 'LEAVE',
      recordId: leave._id.toString(),
      details: {
        teacherName: leave.teacherId.name,
        leaveDays: leave.totalDays,
        status,
        remarks: decisionRemarks,
      },
    });

    res.json({
      success: true,
      message: `Leave request has been ${status} successfully.`,
      leave,
    });
  } catch (err) {
    next(err);
  }
};
