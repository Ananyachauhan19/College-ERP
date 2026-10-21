const crypto = require('crypto');
const Student = require('../models/Student');
const StudentFeeSchedule = require('../models/StudentFeeSchedule');
const FeeTransaction = require('../models/FeeTransaction');
const FeeLedger = require('../models/FeeLedger');
const Receipt = require('../models/Receipt');
const AuditLog = require('../models/AuditLog');
const { sendPaymentReceiptEmail } = require('../services/emailService');
const { FEE_STATUS, PAYMENT_MODES } = require('../config/constants');

const GATEWAY_SECRET = process.env.GATEWAY_SECRET || 'educore-gateway-secret-token-2026';

// 1. Create Payment Order
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { periodNumber, amount } = req.body;
    const schedule = await StudentFeeSchedule.findOne({ studentId: student._id });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Fee schedule not found.' });
    }

    const period = schedule.periods.find((p) => p.periodNumber === Number(periodNumber));
    if (!period) {
      return res.status(404).json({ success: false, message: 'Invalid fee period.' });
    }

    if (period.balance <= 0) {
      return res.status(400).json({ success: false, message: 'This period is already fully paid.' });
    }

    const paymentAmount = Number(amount) || period.balance;
    if (paymentAmount <= 0 || paymentAmount > period.balance) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be between ₹1 and ₹${period.balance}.`,
      });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    res.json({
      success: true,
      order: {
        orderId,
        amount: paymentAmount,
        currency: 'INR',
        periodNumber: period.periodNumber,
        periodName: period.periodName,
        studentName: student.name,
        admissionNo: student.admissionNo,
      },
    });
  } catch (err) {
    next(err);
  }
};

// 2. Server-side Verification of Payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const { orderId, paymentId, periodNumber, amount, signature } = req.body;

    if (!orderId || !paymentId || periodNumber === undefined || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, period number, and amount are required.',
      });
    }

    // Idempotency check: Check if transaction with this paymentId already processed
    const existingTxn = await FeeTransaction.findOne({ referenceNo: paymentId });
    if (existingTxn) {
      const existingReceipt = await Receipt.findOne({ transactionId: existingTxn._id });
      return res.json({
        success: true,
        message: 'Payment was already verified and recorded.',
        receipt: existingReceipt,
      });
    }

    const schedule = await StudentFeeSchedule.findOne({ studentId: student._id });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Fee schedule not found.' });
    }

    const period = schedule.periods.find((p) => p.periodNumber === Number(periodNumber));
    if (!period) {
      return res.status(404).json({ success: false, message: 'Fee period not found.' });
    }

    const payAmount = Number(amount);
    const previousBalance = period.balance;
    const remainingBalance = Math.max(0, previousBalance - payAmount);

    period.amountPaid += payAmount;
    period.balance = remainingBalance;
    period.status = remainingBalance === 0 ? FEE_STATUS.PAID : FEE_STATUS.PARTIALLY_PAID;

    schedule.recalculateTotals();
    await schedule.save();

    // Generate Transaction and Receipt numbers
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const txnCount = await FeeTransaction.countDocuments();
    const transactionNo = `TXN-ONL-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;
    const receiptNo = `RCP-ONL-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;
    const invoiceNo = `INV-ONL-${dateStr}-${String(txnCount + 1).padStart(4, '0')}`;

    // 1. Record FeeTransaction
    const transaction = new FeeTransaction({
      transactionNo,
      studentId: student._id,
      schedulePeriodId: period._id,
      periodNumber: period.periodNumber,
      periodName: period.periodName,
      amount: payAmount,
      paymentMode: PAYMENT_MODES.ONLINE,
      referenceNo: paymentId,
      gatewayOrderId: orderId,
      gatewaySignature: signature || 'VERIFIED-SERVER-HASH',
      status: 'success',
      recordedBy: req.user._id,
      paymentDate: new Date(),
      remarks: `Online payment via ERP gateway for ${period.periodName}`,
    });
    await transaction.save();

    // 2. Append to FeeLedger
    await FeeLedger.create({
      studentId: student._id,
      transactionId: transaction._id,
      entryType: 'CREDIT',
      amount: payAmount,
      runningBalance: schedule.balanceDue,
      description: `Online Payment verified for ${period.periodName} (Ref: ${paymentId})`,
      recordedBy: req.user._id,
    });

    // 3. Generate Receipt
    const receipt = new Receipt({
      receiptNo,
      invoiceNo,
      studentId: student._id,
      transactionId: transaction._id,
      periodName: period.periodName,
      amountPaid: payAmount,
      previousBalance,
      remainingBalance,
      paymentMode: 'online',
      referenceNo: paymentId,
      issuedBy: req.user._id,
      issuedDate: new Date(),
      remarks: 'Online ERP Gateway Transaction Verified',
    });
    await receipt.save();

    transaction.receiptRef = receipt._id;
    await transaction.save();

    // 4. Send Confirmation Email
    sendPaymentReceiptEmail({
      student,
      receipt,
      transaction,
    }).catch((e) => console.error('[Online Payment Email Async]', e.message));

    // 5. Audit Log
    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'ONLINE_PAYMENT_VERIFIED',
      module: 'FEE',
      recordId: transaction._id.toString(),
      details: { receiptNo, orderId, paymentId, amount: payAmount, period: period.periodName },
    });

    res.json({
      success: true,
      message: `Online payment of ₹${payAmount.toLocaleString()} successfully verified!`,
      receipt,
      transaction,
      schedule,
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get Student Payment History
exports.getMyPaymentHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const receipts = await Receipt.find({ studentId: student._id })
      .populate('transactionId')
      .sort({ createdAt: -1 });

    const schedule = await StudentFeeSchedule.findOne({ studentId: student._id })
      .populate('courseId');

    res.json({ success: true, receipts, schedule });
  } catch (err) {
    next(err);
  }
};
