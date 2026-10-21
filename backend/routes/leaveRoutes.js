const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

// Teacher endpoints
router.post('/apply', authorize(ROLES.TEACHER), leaveController.applyLeave);
router.get('/my-leaves', authorize(ROLES.TEACHER), leaveController.getMyLeaves);

// Super Admin endpoints
router.get('/all', authorize(ROLES.SUPER_ADMIN), leaveController.getAllLeaves);
router.patch('/:id/decision', authorize(ROLES.SUPER_ADMIN), leaveController.decideLeave);

module.exports = router;
