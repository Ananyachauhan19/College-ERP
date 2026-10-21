const express = require('express');
const router = express.Router();
const onlinePaymentController = require('../controllers/onlinePaymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Student creates payment order
router.post(
  '/create-order',
  authorize(ROLES.STUDENT),
  onlinePaymentController.createPaymentOrder
);

// Server-side verification of payment
router.post(
  '/verify',
  authorize(ROLES.STUDENT),
  onlinePaymentController.verifyPayment
);

// Student views own transaction & receipt history
router.get(
  '/my-history',
  authorize(ROLES.STUDENT),
  onlinePaymentController.getMyPaymentHistory
);

module.exports = router;
