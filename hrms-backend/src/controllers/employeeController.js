const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateLoginId, generateTempPassword } = require('../utils/loginId');
const { toEmployeeListItem, toEmployeeDetail } = require('../utils/serializers');
const { computeStatus, today } = require('../utils/status');
const asyncHandler = require('../utils/asyncHandler');

// GET /employees (Admin/HR only)
const list = asyncHandler(async (req, res) => {
  const employees = await User.findAll({
    where: { companyId: req.user.companyId },
    order: [['createdAt', 'ASC']],
  });

  const d = today();
  const rows = await Promise.all(
    employees.map(async (emp) => toEmployeeListItem(emp, await computeStatus(emp.id, d)))
  );

  return res.json(rows);
});

// POST /employees (Admin/HR only) — auto-generates loginId + temp password.
// In a full system these credentials would be emailed to the employee;
// for the hackathon demo we just log them to the server console.
const create = asyncHandler(async (req, res) => {
  const { name, email, role, department, jobTitle } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required.' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'An employee with this email already exists.' });
  }

  const company = await req.user.getCompany();
  const loginId = await generateLoginId({
    companyId: company.id,
    companyName: company.name,
    fullName: name,
  });
  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 10);

  const employee = await User.create({
    companyId: company.id,
    loginId,
    name,
    email,
    role: role === 'hr' ? 'hr' : 'employee',
    department,
    jobTitle,
    password: hashed,
    mustChangePassword: true,
  });

  // eslint-disable-next-line no-console
  console.log(`[HRMS] New employee credentials -> loginId: ${loginId}  tempPassword: ${tempPassword}`);

  return res.status(201).json(toEmployeeListItem(employee, 'absent'));
});

// GET /employees/:id (Admin/HR only)
const getOne = asyncHandler(async (req, res) => {
  const employee = await User.findOne({
    where: { id: req.params.id, companyId: req.user.companyId },
  });
  if (!employee) return res.status(404).json({ message: 'Employee not found.' });

  const status = await computeStatus(employee.id, today());
  return res.json(toEmployeeDetail(employee, status));
});

// PATCH /employees/:id (Admin/HR only) — full record edit.
const update = asyncHandler(async (req, res) => {
  const employee = await User.findOne({
    where: { id: req.params.id, companyId: req.user.companyId },
  });
  if (!employee) return res.status(404).json({ message: 'Employee not found.' });

  const { name, email, phone, address, dob, jobTitle, department, joinDate, salary } = req.body;

  if (name !== undefined) employee.name = name;
  if (email !== undefined) employee.email = email;
  if (phone !== undefined) employee.phone = phone;
  if (address !== undefined) employee.address = address;
  if (dob !== undefined) employee.dob = dob || null;
  if (jobTitle !== undefined) employee.jobTitle = jobTitle;
  if (department !== undefined) employee.department = department;
  if (joinDate !== undefined) employee.joinDate = joinDate || null;

  if (salary) {
    if (salary.basic !== undefined) employee.salaryBasic = Number(salary.basic) || 0;
    if (salary.hra !== undefined) employee.salaryHra = Number(salary.hra) || 0;
    if (salary.allowances !== undefined) employee.salaryAllowances = Number(salary.allowances) || 0;
    if (salary.pf !== undefined) employee.salaryPf = Number(salary.pf) || 0;
  }

  await employee.save();

  const status = await computeStatus(employee.id, today());
  return res.json(toEmployeeDetail(employee, status));
});

module.exports = { list, create, getOne, update };
