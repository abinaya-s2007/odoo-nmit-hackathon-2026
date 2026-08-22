const { TimeOffRequest, User } = require('../models');
const { toTimeOffRequestRow } = require('../utils/serializers');
const asyncHandler = require('../utils/asyncHandler');

// GET /timeoff/balance (Employee)
const balance = asyncHandler(async (req, res) => {
  return res.json({
    paid: req.user.paidLeaveBalance,
    sick: req.user.sickLeaveBalance,
  });
});

// POST /timeoff/request (Employee)
const request = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, allocationDays, remarks } = req.body;

  if (!type || !startDate || !endDate) {
    return res.status(400).json({ message: 'type, startDate and endDate are required.' });
  }

  const days = Number(allocationDays) || 1;

  if (type === 'Paid time off' && req.user.paidLeaveBalance < days) {
    return res.status(400).json({ message: 'Not enough paid time off balance.' });
  }
  if (type === 'Sick Leave' && req.user.sickLeaveBalance < days) {
    return res.status(400).json({ message: 'Not enough sick leave balance.' });
  }

  const record = await TimeOffRequest.create({
    userId: req.user.id,
    type,
    startDate,
    endDate,
    allocationDays: days,
    remarks,
  });

  return res.status(201).json(toTimeOffRequestRow(record, req.user.name));
});

// GET /timeoff/requests (Admin/HR — all requests for the company)
const listRequests = asyncHandler(async (req, res) => {
  const employees = await User.findAll({ where: { companyId: req.user.companyId } });
  const employeeIds = employees.map((e) => e.id);
  const nameById = new Map(employees.map((e) => [e.id, e.name]));

  const requests = await TimeOffRequest.findAll({
    where: { userId: employeeIds },
    order: [['createdAt', 'DESC']],
  });

  return res.json(requests.map((r) => toTimeOffRequestRow(r, nameById.get(r.userId))));
});

// PATCH /timeoff/requests/:id (Admin/HR — approve/reject)
const decide = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'status must be "approved" or "rejected".' });
  }

  const record = await TimeOffRequest.findByPk(req.params.id);
  if (!record) return res.status(404).json({ message: 'Request not found.' });

  const employee = await User.findOne({ where: { id: record.userId, companyId: req.user.companyId } });
  if (!employee) return res.status(404).json({ message: 'Request not found.' });

  if (record.status !== 'pending') {
    return res.status(409).json({ message: 'This request has already been decided.' });
  }

  record.status = status;
  record.comment = comment || '';
  await record.save();

  if (status === 'approved') {
    if (record.type === 'Paid time off') {
      employee.paidLeaveBalance = Math.max(0, employee.paidLeaveBalance - record.allocationDays);
    } else if (record.type === 'Sick Leave') {
      employee.sickLeaveBalance = Math.max(0, employee.sickLeaveBalance - record.allocationDays);
    }
    await employee.save();
  }

  return res.json(toTimeOffRequestRow(record, employee.name));
});

module.exports = { balance, request, listRequests, decide };
