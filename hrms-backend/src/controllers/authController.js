const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Company, User } = require('../models');
const { generateLoginId, companyInitials } = require('../utils/loginId');
const { toAuthUser } = require('../utils/serializers');
const asyncHandler = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /auth/signup — per the wireframe note, this is how a *company/admin*
// account gets created. Regular employees never self-register; an
// Admin/HR user creates them from the Employees page instead (see
// employeeController.create), which auto-generates their loginId + a
// temp password.
const signup = asyncHandler(async (req, res) => {
  const { companyName, name, email, phone, password } = req.body;

  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ message: 'companyName, name, email and password are required.' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const company = await Company.create({
    name: companyName,
    initials: companyInitials(companyName),
  });

  const loginId = await generateLoginId({
    companyId: company.id,
    companyName,
    fullName: name,
  });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    companyId: company.id,
    loginId,
    name,
    email,
    phone,
    password: hashed,
    role: 'admin',
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: toAuthUser(user) });
});

// POST /auth/login — accepts either the auto-generated Login ID or email
// in the same "Login Id / Email" field, per the sign-in wireframe.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Login ID and password are required.' });
  }

  const user = await User.findOne({
    where: { [Op.or]: [{ email }, { loginId: email }] },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  return res.json({ token, user: toAuthUser(user) });
});

module.exports = { signup, login };
