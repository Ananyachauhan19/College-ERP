const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate, authorize(ROLES.SUPER_ADMIN));

router.get('/', auditController.getAuditLogs);

module.exports = router;
