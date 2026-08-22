const { Op } = require('sequelize');
const { Attendance, User } = require('../models');
const { toAttendanceRow } = require('../utils/serializers');
const { today } = require('../utils/status');
const asyncHandler = require('../utils/asyncHandler');

function timeNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toHours(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

// POST /attendance/check-in
const checkIn = asyncHandler(async (req, res) => {
  const d = today();
  let record = await Attendance.findOne({ where: { userId: req.user.id, date: d } });

  if (record && record.checkIn) {
    return res.status(409).json({ message: 'Already checked in today.' });
  }

  if (!record) {
    record = await Attendance.create({
      userId: req.user.id,
      date: d,
      checkIn: timeNow(),
      status: 'Present',
    });
  } else {
    record.checkIn = timeNow();
    record.status = 'Present';
    await record.save();
  }

  return res.status(201).json(toAttendanceRow(record, req.user.name));
});

// POST /attendance/check-out
const checkOut = asyncHandler(async (req, res) => {
  const d = today();
  const record = await Attendance.findOne({ where: { userId: req.user.id, date: d } });

  if (!record || !record.checkIn) {
    return res.status(400).json({ message: 'You have not checked in today.' });
  }
  if (record.checkOut) {
    return res.status(409).json({ message: 'Already checked out today.' });
  }

  record.checkOut = timeNow();
  const worked = Math.max(0, toHours(record.checkOut) - toHours(record.checkIn));
  record.workHours = Math.round(Math.min(worked, 8) * 100) / 100;
  record.extraHours = Math.round(Math.max(0, worked - 8) * 100) / 100;
  await record.save();

  return res.json(toAttendanceRow(record, req.user.name));
});

// GET /attendance?date=YYYY-MM-DD (Admin/HR — everyone in the company)
const listAll = asyncHandler(async (req, res) => {
  const date = req.query.date || today();

  const employees = await User.findAll({ where: { companyId: req.user.companyId } });
  const records = await Attendance.findAll({
    where: { date, userId: { [Op.in]: employees.map((e) => e.id) } },
  });

  const byUser = new Map(records.map((r) => [r.userId, r]));

  const rows = employees.map((emp) => {
    const record = byUser.get(emp.id) || { checkIn: null, checkOut: null, workHours: null, extraHours: null, status: 'Absent' };
    return toAttendanceRow(record, emp.name);
  });

  return res.json(rows);
});

// GET /attendance/me?date=YYYY-MM-DD (Employee — own records only)
const listMine = asyncHandler(async (req, res) => {
  const date = req.query.date || today();
  const record = await Attendance.findOne({ where: { userId: req.user.id, date } });

  if (!record) {
    return res.json([toAttendanceRow({ status: 'Absent' }, req.user.name)]);
  }
  return res.json([toAttendanceRow(record, req.user.name)]);
});

module.exports = { checkIn, checkOut, listAll, listMine };
