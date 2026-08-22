const { Op } = require('sequelize');
const { Attendance, TimeOffRequest } = require('../models');

function today() {
  return new Date().toISOString().slice(0, 10);
}

// Returns 'present' | 'leave' | 'absent' for the frontend's StatusDot.
async function computeStatus(userId, date) {
  const d = date || today();

  const attendance = await Attendance.findOne({ where: { userId, date: d } });
  if (attendance && attendance.checkIn) return 'present';

  const onLeave = await TimeOffRequest.findOne({
    where: {
      userId,
      status: 'approved',
      startDate: { [Op.lte]: d },
      endDate: { [Op.gte]: d },
    },
  });
  if (onLeave) return 'leave';

  return 'absent';
}

module.exports = { computeStatus, today };
