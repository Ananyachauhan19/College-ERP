const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const AuditLog = require('../models/AuditLog');
const { JWT_SECRET } = require('../middleware/auth');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Fetch linked profile if any
    let profile = null;
    if (user.role === 'STUDENT' && user.profileId) {
      profile = await Student.findById(user.profileId).populate('departmentId courseId');
    } else if (user.role === 'TEACHER' && user.profileId) {
      profile = await Teacher.findById(user.profileId).populate('departmentId');
    }

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;
    if (user.role === 'STUDENT' && user.profileId) {
      profile = await Student.findById(user.profileId).populate('departmentId courseId');
    } else if (user.role === 'TEACHER' && user.profileId) {
      profile = await Teacher.findById(user.profileId).populate('departmentId');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};
