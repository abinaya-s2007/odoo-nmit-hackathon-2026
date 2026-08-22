const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}

// Admin/HR are treated as one class per the frontend's isAdmin checks.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Admin or HR access required.' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
