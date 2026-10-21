const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, userId, limit = 50 } = req.query;
    const query = {};

    if (module) query.module = module;
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
};
