const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Teacher: View own payslips
router.get('/my-payslips', authorize(ROLES.TEACHER), payrollController.getMyPayslips);

// Super Admin: Salary structures & payroll operations
router.get(
  '/salary-structures',
  authorize(ROLES.SUPER_ADMIN),
  payrollController.getSalaryStructures
);
router.post(
  '/salary-structures',
  authorize(ROLES.SUPER_ADMIN),
  payrollController.saveSalaryStructure
);
router.post(
  '/calculate',
  authorize(ROLES.SUPER_ADMIN),
  payrollController.previewPayrollCalculation
);
router.post(
  '/generate',
  authorize(ROLES.SUPER_ADMIN),
  payrollController.generatePayroll
);
router.patch(
  '/:id/mark-paid',
  authorize(ROLES.SUPER_ADMIN),
  payrollController.markPayrollPaid
);
router.get('/all', authorize(ROLES.SUPER_ADMIN), payrollController.getAllPayrolls);

module.exports = router;
