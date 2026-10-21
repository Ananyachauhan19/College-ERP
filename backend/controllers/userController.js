const User = require('../models/User');
const Teacher = require('../models/Teacher');
const AuditLog = require('../models/AuditLog');
const { ROLES } = require('../config/constants');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, departmentId, designation } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${Object.values(ROLES).join(', ')}`,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      phone,
      isActive: true,
    });

    await newUser.save();

    // If role is TEACHER, automatically create matching Teacher profile
    if (role === ROLES.TEACHER) {
      const teacherCount = await Teacher.countDocuments();
      const employeeId = `TCH-${String(teacherCount + 101).padStart(4, '0')}`;
      const teacher = await Teacher.create({
        employeeId,
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || 'N/A',
        departmentId: departmentId || null,
        designation: designation || 'Assistant Professor',
      });
      newUser.profileId = teacher._id;
      newUser.profileModel = 'Teacher';
      await newUser.save();
    }

    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: 'CREATE_USER',
      module: 'USER',
      recordId: newUser._id.toString(),
      details: { email: newUser.email, role: newUser.role, name: newUser.name },
    });

    res.status(201).json({
      success: true,
      message: `User created successfully as ${role}.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own activation status.',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      userRole: req.user.role,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      module: 'USER',
      recordId: user._id.toString(),
      details: { targetEmail: user.email, newStatus: user.isActive },
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      user: { id: user._id, email: user.email, isActive: user.isActive },
    });
  } catch (err) {
    next(err);
  }
};
