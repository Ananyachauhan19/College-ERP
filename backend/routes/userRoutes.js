const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// Super Admin only
router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.patch('/:id/status', userController.toggleUserStatus);

module.exports = router;
