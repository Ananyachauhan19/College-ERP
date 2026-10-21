const Student = require('../models/Student');
const StudentFeeSchedule = require('../models/StudentFeeSchedule');
const FeeTransaction = require('../models/FeeTransaction');
const Department = require('../models/Department');
const Course = require('../models/Course');
const LeaveRequest = require('../models/LeaveRequest');
const Payroll = require('../models/Payroll');
const { PAYMENT_MODES, FEE_STATUS } = require('../config/constants');

exports.getSummaryReports = async (req, res, next) => {
  try {
    // 1. Student Counts
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ admissionStatus: 'active' });

    // 2. Department-wise count
    const departments = await Department.find();
    const departmentBreakdown = await Promise.all(
      departments.map(async (dept) => {
        const count = await Student.countDocuments({ departmentId: dept._id });
        return { name: dept.name, code: dept.code, count };
      })
    );

    // 3. Course-wise count
    const courses = await Course.find();
    const courseBreakdown = await Promise.all(
      courses.map(async (course) => {
        const count = await Student.countDocuments({ courseId: course._id });
        return { name: course.name, code: course.code, count };
      })
    );

    // 4. Financial Collection Totals from StudentFeeSchedule
    const feeSchedules = await StudentFeeSchedule.find();
    let totalExpectedFees = 0;
    let totalCollectedFees = 0;
    let totalOutstandingFees = 0;
    let totalScholarships = 0;
    let fullyPaidStudents = 0;
    let partiallyPaidStudents = 0;
    let unpaidStudents = 0;

    feeSchedules.forEach((sched) => {
      totalExpectedFees += sched.netPayable || 0;
      totalCollectedFees += sched.totalPaid || 0;
      totalOutstandingFees += sched.balanceDue || 0;
      totalScholarships += sched.totalScholarship || 0;

      if (sched.balanceDue === 0 && sched.netPayable > 0) {
        fullyPaidStudents++;
      } else if (sched.totalPaid > 0 && sched.balanceDue > 0) {
        partiallyPaidStudents++;
      } else {
        unpaidStudents++;
      }
    });

    // 5. Payment Mode Breakdown (Online vs Offline)
    const transactions = await FeeTransaction.find({ status: 'success' });
    let totalOnlineCollections = 0;
    let totalOfflineCollections = 0;

    transactions.forEach((t) => {
      if (t.paymentMode === PAYMENT_MODES.ONLINE) {
        totalOnlineCollections += t.amount || 0;
      } else {
        totalOfflineCollections += t.amount || 0;
      }
    });

    // 6. Overdue Accounts Count
    const now = new Date();
    let overduePeriodsCount = 0;
    feeSchedules.forEach((sched) => {
      sched.periods.forEach((p) => {
        if (p.dueDate < now && p.balance > 0) {
          overduePeriodsCount++;
        }
      });
    });

    // 7. Recent Transactions (last 10)
    const recentTransactions = await FeeTransaction.find({ status: 'success' })
      .populate('studentId', 'name admissionNo')
      .sort({ createdAt: -1 })
      .limit(10);

    // 8. Leave & Payroll Quick Stats
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const finalizedPayrolls = await Payroll.countDocuments({ status: 'finalized' });

    res.json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        totalExpectedFees,
        totalCollectedFees,
        totalOutstandingFees,
        totalScholarships,
        totalOnlineCollections,
        totalOfflineCollections,
        fullyPaidStudents,
        partiallyPaidStudents,
        unpaidStudents,
        overduePeriodsCount,
        pendingLeaves,
        finalizedPayrolls,
      },
      departmentBreakdown,
      courseBreakdown,
      recentTransactions,
    });
  } catch (err) {
    next(err);
  }
};
