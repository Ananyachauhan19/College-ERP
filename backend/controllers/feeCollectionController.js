const Student = require('../models/Student');
const StudentFeeSchedule = require('../models/StudentFeeSchedule');
const FeeTransaction = require('../models/FeeTransaction');
const FeeLedger = require('../models/FeeLedger');
const Receipt = require('../models/Receipt');
const Scholarship = require('../models/Scholarship');
const FeeStructure = require('../models/FeeStructure');
const AuditLog = require('../models/AuditLog');
const { sendPaymentReceiptEmail } = require('../services/emailService');
const { FEE_STATUS, PAYMENT_MODES } = require('../config/constants');

// List Fee Structures
exports.getFeeStructures = async (req, res, next) => {
  try {
    const structures = await FeeStructure.find().populate('courseId').sort({ createdAt: -1 });
    res.json({ success: true, structures });
  } catch (err) {
    next(err);
  }
};

// Create Fee Structure
exports.createFeeStructure = async (req, res, next) => {
  try {
    const { name, courseId, academicYear, feeHeads, defaultFrequency, remarks } = req.body;
    const totalAmount = feeHeads.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    const structure = await FeeStructure.create({
      name,
      courseId,
      academicYear: academicYear || '2026-2027',
      feeHeads,
      totalAmount,
      defaultFrequency,
      remarks,
    });

    res.status(201).json({ success: true, structure });
  } catch (err) {
    next(err);
  }
};

// Get Student Fee Schedule
exports.getStudentSchedule = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const schedule = await StudentFeeSchedule.findOne({ studentId })
      .populate('courseId', 'name code durationYears')
      .populate('studentId');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Fee schedule not found for this student.' });
    }

    res.json({ success: true, schedule });
  } catch (err) {
    next(err);
  }
};

// Record Offline Payment (Counter payment: Mark as Paid or Partial)
exports.collectOfflinePayment = async (req, res, next) => {
  try {
    const {
      studentId,
      periodNumber,
      amount,
      paymentMode,
      referenceNo,
      remarks,
      isMarkAsPaid, // boolean flag if clicking "Mark as Paid"
    } = req.body;

    if (!studentId || periodNumber === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and period number are required.',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found.' });
    }

    const schedule = await StudentFeeSchedule.findOne({ studentId });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Fee schedule not found for student.' });
    }

    const period = schedule.periods.find((p) => p.periodNumber === Number(periodNumber));
    if (!period) {
      return res.status(404).json({ success: false, message: `Fee period ${periodNumber} not found.` });
    }

    if (period.balance <= 0) {
      return res.status(400).json({
        success: false,
        message: `Period ${period.periodName} is already fully paid. Outstanding balance is 0.`,
      });
    }

    // Determine payment amount
    let paymentAmount = Number(amount);
    if (isMarkAsPaid || !paymentAmount) {
      paymentAmount = period.balance;
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero.',
      });
    }

    if (paymentAmount > period.balance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${paymentAmount}) cannot exceed period outstanding balance (₹${period.balance}).`,
      });
    }

    const previousPeriodBalance = period.balance;
    const remainingPeriodBalance = previousPeriodBalance - paymentAmount;

    // Update period amounts
    period.amountPaid += paymentAmount;
    period.balance = remainingPeriodBalance;
    period.status = remainingPeriodBalance === 0 ? FEE_STATUS.PAID : FEE_STATUS.PARTIALLY_PAID;

    // Recalculate schedule-level totals
    schedule.recalculateTotals();
    await schedule.save();

    // Generate unique transaction number & receipt number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const txnCount = await FeeTransaction.countDocuments();
    const transactionNo = `TXN-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;
    const receiptNo = `RCP-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;
    const invoiceNo = `INV-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;

    // 1. Create FeeTransaction
    const transaction = new FeeTransaction({
      transactionNo,
      studentId: student._id,
      schedulePeriodId: period._id,
      periodNumber: period.periodNumber,
      periodName: period.periodName,
      amount: paymentAmount,
      paymentMode: paymentMode || PAYMENT_MODES.CASH,
      referenceNo: referenceNo || `COUNTER-${Date.now()}`,
      status: 'success',
      recordedBy: req.user._id,
      paymentDate: new Date(),
      remarks: remarks || `Offline fee collection for ${period.periodName}`,
    });
    await transaction.save();

    // 2. Append to FeeLedger
    await FeeLedger.create({
      studentId: student._id,
      transactionId: transaction._id,
      entryType: 'CREDIT',
      amount: paymentAmount,
      runningBalance: schedule.balanceDue,
      description: `Offline Payment received for ${period.periodName} (${paymentMode || 'cash'})`,
      recordedBy: req.user._id,
    });

    // 3. Create Official Receipt
    const receipt = new Receipt({
      receiptNo,
      invoiceNo,
      studentId: student._id,
      transactionId: transaction._id,
      periodName: period.periodName,
      amountPaid: paymentAmount,
      previousBalance: previousPeriodBalance,
      remainingBalance: remainingPeriodBalance,
      paymentMode: paymentMode || 'cash',
      referenceNo: transaction.referenceNo,
      issuedBy: req.user._id,
      issuedDate: new Date(),
      remarks,
    });
    await receipt.save();

    // Link receipt back to transaction
    transaction.receiptRef = receipt._id;
    await transaction.save();

    // 4. Send email receipt asynchronously
    sendPaymentReceiptEmail({
      student,
      receipt,
      transaction,
    }).catch((e) => console.error('[Receipt Email Async]', e.message));

    // 5. Record Audit Log
    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'COLLECT_OFFLINE_PAYMENT',
      module: 'FEE',
      recordId: transaction._id.toString(),
      details: {
        receiptNo,
        studentAdmissionNo: student.admissionNo,
        amount: paymentAmount,
        mode: paymentMode,
        period: period.periodName,
        remainingBalance: remainingPeriodBalance,
      },
    });

    res.status(200).json({
      success: true,
      message: `Payment of ₹${paymentAmount.toLocaleString()} recorded successfully. Receipt generated: ${receiptNo}`,
      receipt,
      transaction,
      schedule,
    });
  } catch (err) {
    next(err);
  }
};

// Get Receipt Details
exports.getReceiptDetails = async (req, res, next) => {
  try {
    const { receiptNo } = req.params;
    const receipt = await Receipt.findOne({ receiptNo })
      .populate({
        path: 'studentId',
        populate: [
          { path: 'courseId', select: 'name code durationYears' },
          { path: 'departmentId', select: 'name code' },
        ],
      })
      .populate('issuedBy', 'name email role')
      .populate('transactionId');

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    res.json({ success: true, receipt });
  } catch (err) {
    next(err);
  }
};

// Get All Receipts / Transactions
exports.getReceipts = async (req, res, next) => {
  try {
    const { studentId, search } = req.query;
    const query = {};
    if (studentId) query.studentId = studentId;
    if (search) query.receiptNo = { $regex: search, $options: 'i' };

    const receipts = await Receipt.find(query)
      .populate('studentId', 'name admissionNo email phone')
      .populate('issuedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, receipts });
  } catch (err) {
    next(err);
  }
};

// Apply Scholarship or Concession
exports.applyScholarship = async (req, res, next) => {
  try {
    const { studentId, name, type, value, reason, appliedPeriodNumber } = req.body;

    const schedule = await StudentFeeSchedule.findOne({ studentId });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Fee schedule not found.' });
    }

    let concessionAmount = 0;
    if (type === 'percentage') {
      concessionAmount = Math.round((schedule.totalCourseFee * Number(value)) / 100);
    } else {
      concessionAmount = Number(value);
    }

    const scholarship = await Scholarship.create({
      studentId,
      name: name || 'Institutional Concession',
      type: type || 'fixed',
      value: Number(value),
      approvedAmount: concessionAmount,
      appliedPeriodNumber: appliedPeriodNumber ? Number(appliedPeriodNumber) : null,
      approvedBy: req.user._id,
      status: 'approved',
      reason,
    });

    // Apply concession to designated period or distributed
    if (appliedPeriodNumber) {
      const period = schedule.periods.find((p) => p.periodNumber === Number(appliedPeriodNumber));
      if (period) {
        period.scholarshipDeduction += concessionAmount;
        period.netDue = Math.max(0, period.baseAmount - period.scholarshipDeduction + period.lateFeeApplied);
        period.balance = Math.max(0, period.netDue - period.amountPaid);
        if (period.balance === 0 && period.netDue > 0) period.status = FEE_STATUS.PAID;
      }
    } else {
      // Split evenly across unpaid periods
      const unpaidPeriods = schedule.periods.filter((p) => p.balance > 0);
      if (unpaidPeriods.length > 0) {
        const splitAmount = Math.floor(concessionAmount / unpaidPeriods.length);
        unpaidPeriods.forEach((p) => {
          p.scholarshipDeduction += splitAmount;
          p.netDue = Math.max(0, p.baseAmount - p.scholarshipDeduction + p.lateFeeApplied);
          p.balance = Math.max(0, p.netDue - p.amountPaid);
          if (p.balance === 0) p.status = FEE_STATUS.PAID;
        });
      }
    }

    schedule.recalculateTotals();
    await schedule.save();

    await FeeLedger.create({
      studentId,
      entryType: 'CONCESSION',
      amount: concessionAmount,
      runningBalance: schedule.balanceDue,
      description: `Scholarship/Concession applied: ${scholarship.name}`,
      recordedBy: req.user._id,
    });

    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'APPLY_SCHOLARSHIP',
      module: 'FEE',
      recordId: scholarship._id.toString(),
      details: { concessionAmount, scholarshipName: scholarship.name },
    });

    res.json({
      success: true,
      message: `Concession of ₹${concessionAmount.toLocaleString()} applied successfully.`,
      scholarship,
      schedule,
    });
  } catch (err) {
    next(err);
  }
};
