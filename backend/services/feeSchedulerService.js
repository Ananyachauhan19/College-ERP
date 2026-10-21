const { PAYMENT_FREQUENCIES, FEE_STATUS } = require('../config/constants');

/**
 * Generates structured fee schedule periods based on course duration, total fee, and payment plan.
 *
 * @param {Object} options
 * @param {number} options.durationYears - Duration in years (e.g. 4)
 * @param {number} options.totalCourseFee - Total agreed fee (e.g. 240000)
 * @param {string} options.paymentFrequency - 'yearly' | 'semester' | 'installment'
 * @param {Date} [options.startDate] - Start date of the course or admission date
 * @param {number} [options.scholarshipAmount] - Total scholarship/concession amount
 * @returns {Array<Object>} List of period schedule objects
 */
function generateFeeSchedulePeriods({
  durationYears,
  totalCourseFee,
  paymentFrequency,
  startDate = new Date(),
  scholarshipAmount = 0,
}) {
  let periodCount = 1;
  let intervalMonths = 12;
  let namePrefix = 'Year';

  if (paymentFrequency === PAYMENT_FREQUENCIES.YEARLY) {
    periodCount = Math.max(1, durationYears);
    intervalMonths = 12;
    namePrefix = 'Academic Year';
  } else if (paymentFrequency === PAYMENT_FREQUENCIES.SEMESTER) {
    periodCount = Math.max(1, durationYears * 2);
    intervalMonths = 6;
    namePrefix = 'Semester';
  } else if (paymentFrequency === PAYMENT_FREQUENCIES.INSTALLMENT) {
    // 3 installments per year default
    periodCount = Math.max(1, durationYears * 3);
    intervalMonths = 4;
    namePrefix = 'Installment';
  } else {
    // Default fallback to semester
    periodCount = Math.max(1, durationYears * 2);
    intervalMonths = 6;
    namePrefix = 'Semester';
  }

  // Calculate base amount per period with precision handling
  const rawBase = Math.floor(totalCourseFee / periodCount);
  const remainder = totalCourseFee - rawBase * periodCount;

  // Distribute scholarship evenly across periods
  const rawScholarship = Math.floor(scholarshipAmount / periodCount);
  const scholarshipRemainder = scholarshipAmount - rawScholarship * periodCount;

  const periods = [];
  const baseDate = new Date(startDate);

  for (let i = 1; i <= periodCount; i++) {
    // Period due date: First period due within 15 days, subsequent periods spaced by intervalMonths
    const dueDate = new Date(baseDate);
    if (i === 1) {
      dueDate.setDate(dueDate.getDate() + 15);
    } else {
      dueDate.setMonth(dueDate.getMonth() + (i - 1) * intervalMonths);
      dueDate.setDate(10); // Standardized to 10th of the month
    }

    // Add remainder to the last period
    const periodBase = i === periodCount ? rawBase + remainder : rawBase;
    const periodScholarship =
      i === periodCount ? rawScholarship + scholarshipRemainder : rawScholarship;
    const netDue = Math.max(0, periodBase - periodScholarship);

    periods.push({
      periodNumber: i,
      periodName: `${namePrefix} ${i}`,
      dueDate,
      baseAmount: periodBase,
      scholarshipDeduction: periodScholarship,
      lateFeeApplied: 0,
      netDue: netDue,
      amountPaid: 0,
      balance: netDue,
      status: FEE_STATUS.PENDING,
    });
  }

  return periods;
}

module.exports = { generateFeeSchedulePeriods };
