const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// List admissions (Super Admin, Admission Cell, Fee Operation)
router.get(
  '/',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMISSION_CELL, ROLES.FEE_OPERATION),
  admissionController.getAdmissions
);

// Get specific admission
router.get(
  '/:id',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMISSION_CELL, ROLES.FEE_OPERATION, ROLES.STUDENT),
  admissionController.getAdmissionById
);

// Create new admission (Admission Cell, Super Admin)
router.post(
  '/',
  authorize(ROLES.ADMISSION_CELL, ROLES.SUPER_ADMIN),
  admissionController.createAdmission
);

// Update admission
router.put(
  '/:id',
  authorize(ROLES.ADMISSION_CELL, ROLES.SUPER_ADMIN),
  admissionController.updateAdmission
);

module.exports = router;
