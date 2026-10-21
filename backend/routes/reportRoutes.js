const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(
  authenticate,
  authorize(ROLES.SUPER_ADMIN, ROLES.FEE_OPERATION, ROLES.ADMISSION_CELL)
);

router.get('/summary', reportController.getSummaryReports);

module.exports = router;
