const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

router.use(authenticate);

router.get('/departments', academicController.getDepartments);
router.post('/departments', authorize(ROLES.SUPER_ADMIN), academicController.createDepartment);

router.get('/courses', academicController.getCourses);
router.post('/courses', authorize(ROLES.SUPER_ADMIN), academicController.createCourse);

router.get('/academic-years', academicController.getAcademicYears);

module.exports = router;
