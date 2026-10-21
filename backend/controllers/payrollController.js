const Teacher = require('../models/Teacher');
const TeacherSalaryStructure = require('../models/TeacherSalaryStructure');
const Payroll = require('../models/Payroll');
const AuditLog = require('../models/AuditLog');
const { calculateMonthlyPayroll } = require('../services/payrollService');
const { sendPayslipEmail } = require('../services/emailService');
const { PAYROLL_STATUS } = require('../config/constants');

// Super Admin: List or Get Salary Structures
exports.getSalaryStructures = async (req, res, next) => {
  try {
    const structures = await TeacherSalaryStructure.find()
      .populate({
        path: 'teacherId',
        populate: { path: 'departmentId', select: 'name code' },
      });
    res.json({ success: true, structures });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Configure Salary Structure for Teacher
exports.saveSalaryStructure = async (req, res, next) => {
  try {
    const {
      teacherId,
      calculationType,
      baseMonthlySalary,
      dailyRate,
      paidLeavesAllowedPerMonth,
      hra,
      allowances,
      standardDeductions,
    } = req.body;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required.' });
    }

    let structure = await TeacherSalaryStructure.findOne({ teacherId });
    if (structure) {
      structure.calculationType = calculationType || structure.calculationType;
      structure.baseMonthlySalary = Number(baseMonthlySalary) ?? structure.baseMonthlySalary;
      structure.dailyRate = Number(dailyRate) ?? structure.dailyRate;
      structure.paidLeavesAllowedPerMonth = Number(paidLeavesAllowedPerMonth) ?? structure.paidLeavesAllowedPerMonth;
      structure.hra = Number(hra) ?? structure.hra;
      structure.allowances = Number(allowances) ?? structure.allowances;
      structure.standardDeductions = Number(standardDeductions) ?? structure.standardDeductions;
      await structure.save();
    } else {
      structure = await TeacherSalaryStructure.create({
        teacherId,
        calculationType: calculationType || 'monthly',
        baseMonthlySalary: Number(baseMonthlySalary) || 50000,
        dailyRate: Number(dailyRate) || 2000,
        paidLeavesAllowedPerMonth: Number(paidLeavesAllowedPerMonth) || 2,
        hra: Number(hra) || 5000,
        allowances: Number(allowances) || 3000,
        standardDeductions: Number(standardDeductions) || 1000,
      });
      await Teacher.findByIdAndUpdate(teacherId, { salaryStructureRef: structure._id });
    }

    res.json({
      success: true,
      message: 'Teacher salary structure configured successfully.',
      structure,
    });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Preview Payroll Calculation
exports.previewPayrollCalculation = async (req, res, next) => {
  try {
    const { teacherId, payrollMonth } = req.body;

    if (!teacherId || !payrollMonth) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and payroll month (YYYY-MM) are required.',
      });
    }

    const calculation = await calculateMonthlyPayroll({ teacherId, payrollMonth });
    const teacher = await Teacher.findById(teacherId).populate('departmentId');

    // Check if payroll already finalized
    const existing = await Payroll.findOne({ teacherId, payrollMonth });

    res.json({
      success: true,
      calculation,
      teacher,
      isAlreadyGenerated: !!existing,
      existingPayroll: existing,
    });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Generate / Finalize Payroll
exports.generatePayroll = async (req, res, next) => {
  try {
    const { teacherId, payrollMonth, remarks } = req.body;

    if (!teacherId || !payrollMonth) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and payroll month are required.',
      });
    }

    // Check for duplicate payroll
    const existing = await Payroll.findOne({ teacherId, payrollMonth });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${payrollMonth} has already been generated (Ref: ${existing.payrollNo}).`,
      });
    }

    const calc = await calculateMonthlyPayroll({ teacherId, payrollMonth });
    const teacher = await Teacher.findById(teacherId);

    const count = await Payroll.countDocuments();
    const cleanMonth = payrollMonth.replace('-', '');
    const payrollNo = `PAY-${cleanMonth}-${String(count + 1).padStart(4, '0')}`;

    const payroll = new Payroll({
      payrollNo,
      teacherId,
      payrollMonth,
      calculationType: calc.calculationType,
      baseSalary: calc.baseSalary,
      dailyRate: calc.dailyRate,
      workingDaysInMonth: calc.workingDaysInMonth,
      paidLeavesCount: calc.paidLeavesCount,
      unpaidLeavesCount: calc.unpaidLeavesCount,
      leaveDeduction: calc.leaveDeduction,
      deductionReason: calc.deductionReason,
      allowances: calc.allowances,
      statutoryDeductions: calc.statutoryDeductions,
      netPayable: calc.netPayable,
      status: PAYROLL_STATUS.FINALIZED,
      generatedBy: req.user._id,
      remarks: remarks || `Finalized monthly payroll for ${payrollMonth}`,
    });
    await payroll.save();

    // Send payslip email asynchronously
    sendPayslipEmail({ teacher, payroll }).catch((e) =>
      console.error('[Payslip Email Async]', e.message)
    );

    // Audit Log
    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'GENERATE_PAYROLL',
      module: 'PAYROLL',
      recordId: payroll._id.toString(),
      details: { payrollNo, teacherName: teacher.name, month: payrollMonth, netPayable: calc.netPayable },
    });

    res.status(201).json({
      success: true,
      message: `Payroll finalized successfully. Payroll Ref: ${payrollNo}`,
      payroll,
    });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Mark Payroll as Paid
exports.markPayrollPaid = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findById(id).populate('teacherId');

    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    payroll.status = PAYROLL_STATUS.PAID;
    payroll.paymentDate = new Date();
    await payroll.save();

    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'PAYROLL_DISBURSED',
      module: 'PAYROLL',
      recordId: payroll._id.toString(),
      details: { payrollNo: payroll.payrollNo, teacherName: payroll.teacherId.name },
    });

    res.json({
      success: true,
      message: `Payroll ${payroll.payrollNo} marked as PAID.`,
      payroll,
    });
  } catch (err) {
    next(err);
  }
};

// Super Admin: Get All Payroll Records
exports.getAllPayrolls = async (req, res, next) => {
  try {
    const { payrollMonth, status, teacherId } = req.query;
    const query = {};

    if (payrollMonth) query.payrollMonth = payrollMonth;
    if (status) query.status = status;
    if (teacherId) query.teacherId = teacherId;

    const payrolls = await Payroll.find(query)
      .populate({
        path: 'teacherId',
        populate: { path: 'departmentId', select: 'name code' },
      })
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payrolls.length, payrolls });
  } catch (err) {
    next(err);
  }
};

// Teacher: View My Payslips
exports.getMyPayslips = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const payslips = await Payroll.find({ teacherId: teacher._id }).sort({ payrollMonth: -1 });
    const salaryStructure = await TeacherSalaryStructure.findOne({ teacherId: teacher._id });

    res.json({ success: true, count: payslips.length, payslips, salaryStructure });
  } catch (err) {
    next(err);
  }
};
