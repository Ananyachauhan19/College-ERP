const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeCollectionController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Fee Structures
router.get(
  '/structures',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION, ROLES.ADMISSION_CELL),
  feeController.getFeeStructures
);
router.post(
  '/structures',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION),
  feeController.createFeeStructure
);

// Student Schedule
router.get(
  '/schedule/:studentId',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION, ROLES.ADMISSION_CELL, ROLES.STUDENT),
  feeController.getStudentSchedule
);

// Record Offline Payment ("Mark as Paid" or partial counter payment)
router.post(
  '/collect-offline',
  authorize(ROLES.FEE_OPERATION, ROLES.SUPER_ADMIN),
  feeController.collectOfflinePayment
);

// Receipts
router.get(
  '/receipts',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION),
  feeController.getReceipts
);
router.get(
  '/receipts/:receiptNo',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION, ROLES.STUDENT),
  feeController.getReceiptDetails
);

// Scholarships & Concessions
router.post(
  '/scholarships',
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION),
  feeController.applyScholarship
);

module.exports = router;
