const { SALARY_CALCULATION_TYPES, LEAVE_STATUS, LEAVE_TYPES } = require('../config/constants');
const LeaveRequest = require('../models/LeaveRequest');
const TeacherSalaryStructure = require('../models/TeacherSalaryStructure');

/**
 * Calculates teacher salary and unpaid leave deductions for a given month.
 *
 * @param {Object} options
 * @param {string} options.teacherId - Teacher ObjectId
 * @param {string} options.payrollMonth - Month string "YYYY-MM"
 * @returns {Promise<Object>} Calculated payroll breakdown
 */
async function calculateMonthlyPayroll({ teacherId, payrollMonth }) {
  const salaryStructure = await TeacherSalaryStructure.findOne({
    teacherId,
    isActive: true,
  });

  if (!salaryStructure) {
    throw new Error('Salary structure not configured for this teacher.');
  }

  // Parse start and end of payroll month
  const [yearStr, monthStr] = payrollMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed

  const monthStart = new Date(Date.UTC(year, month, 1));
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  const daysInMonth = monthEnd.getDate();

  // Retrieve all APPROVED leaves for this teacher within the target month
  const approvedLeaves = await LeaveRequest.find({
    teacherId,
    status: LEAVE_STATUS.APPROVED,
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  });

  let totalApprovedLeaveDays = 0;
  let explicitUnpaidDays = 0;
  let standardApprovedDays = 0;

  for (const leave of approvedLeaves) {
    // Calculate overlap with the target month
    const effectiveStart = leave.startDate < monthStart ? monthStart : leave.startDate;
    const effectiveEnd = leave.endDate > monthEnd ? monthEnd : leave.endDate;
    const diffTime = Math.abs(effectiveEnd - effectiveStart);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    totalApprovedLeaveDays += days;
    if (leave.leaveType === LEAVE_TYPES.UNPAID) {
      explicitUnpaidDays += days;
    } else {
      standardApprovedDays += days;
    }
  }

  // Allowance check: only standard leaves count towards paid leave allowance
  const paidAllowance = salaryStructure.paidLeavesAllowedPerMonth || 2;
  const excessStandardDays = Math.max(0, standardApprovedDays - paidAllowance);
  const totalUnpaidDays = explicitUnpaidDays + excessStandardDays;
  const paidLeavesCount = Math.min(standardApprovedDays, paidAllowance);

  // Daily rate calculation
  let dailySalaryRate = salaryStructure.dailyRate;
  if (salaryStructure.calculationType === SALARY_CALCULATION_TYPES.MONTHLY) {
    dailySalaryRate = Math.round(salaryStructure.baseMonthlySalary / daysInMonth);
  }

  let leaveDeduction = 0;
  let deductionReason = 'No deductions. All approved leaves covered by monthly allowance.';

  if (totalUnpaidDays > 0) {
    leaveDeduction = totalUnpaidDays * dailySalaryRate;
    deductionReason = `Deduction for ${totalUnpaidDays} unpaid leave day(s) at ₹${dailySalaryRate}/day (${explicitUnpaidDays} explicit unpaid, ${excessStandardDays} exceeding paid allowance of ${paidAllowance} days).`;
  }

  const baseSalary = salaryStructure.baseMonthlySalary;
  const allowances = (salaryStructure.hra || 0) + (salaryStructure.allowances || 0);
  const statutoryDeductions = salaryStructure.standardDeductions || 0;

  let netPayable = 0;
  if (salaryStructure.calculationType === SALARY_CALCULATION_TYPES.PER_DAY) {
    const payableDays = Math.max(0, daysInMonth - totalUnpaidDays);
    netPayable = payableDays * dailySalaryRate + allowances - statutoryDeductions;
  } else {
    netPayable = Math.max(0, baseSalary + allowances - leaveDeduction - statutoryDeductions);
  }

  return {
    teacherId,
    payrollMonth,
    calculationType: salaryStructure.calculationType,
    baseSalary,
    dailyRate: dailySalaryRate,
    workingDaysInMonth: daysInMonth,
    paidLeavesCount,
    unpaidLeavesCount: totalUnpaidDays,
    leaveDeduction,
    deductionReason,
    allowances,
    statutoryDeductions,
    netPayable: Math.round(netPayable),
    salaryStructure,
  };
}

module.exports = { calculateMonthlyPayroll };
