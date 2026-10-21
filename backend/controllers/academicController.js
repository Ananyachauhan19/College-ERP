const Department = require('../models/Department');
const Course = require('../models/Course');
const AcademicYear = require('../models/AcademicYear');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) {
    next(err);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, headOfDepartment, description } = req.body;
    const department = await Department.create({
      name,
      code,
      headOfDepartment,
      description,
    });
    res.status(201).json({ success: true, department });
  } catch (err) {
    next(err);
  }
};

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('departmentId').sort({ name: 1 });
    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, departmentId, durationYears, baseAnnualFee, description } = req.body;
    const course = await Course.create({
      name,
      code,
      departmentId,
      durationYears: Number(durationYears) || 4,
      totalSemesters: (Number(durationYears) || 4) * 2,
      baseAnnualFee: Number(baseAnnualFee) || 50000,
      description,
    });
    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

exports.getAcademicYears = async (req, res, next) => {
  try {
    const academicYears = await AcademicYear.find().sort({ yearName: -1 });
    res.json({ success: true, academicYears });
  } catch (err) {
    next(err);
  }
};
