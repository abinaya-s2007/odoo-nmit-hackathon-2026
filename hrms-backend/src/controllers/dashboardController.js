const { TimeOffRequest, Attendance } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// GET /dashboard/alerts — simple recent-activity feed for the employee
// landing page (spec 3.2.1). Built from the user's own recent time off
// decisions and attendance, newest first.
const alerts = asyncHandler(async (req, res) => {
  const timeOffItems = await TimeOffRequest.findAll({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']],
    limit: 5,
  });

  const attendanceItems = await Attendance.findAll({
    where: { userId: req.user.id },
    order: [['date', 'DESC']],
    limit: 5,
  });

  const items = [];

  timeOffItems.forEach((r) => {
    if (r.status === 'pending') {
      items.push({
        id: `timeoff-${r.id}`,
        message: `Your ${r.type} request (${r.startDate} to ${r.endDate}) is pending approval.`,
        date: r.updatedAt,
      });
    } else {
      items.push({
        id: `timeoff-${r.id}`,
        message: `Your ${r.type} request (${r.startDate} to ${r.endDate}) was ${r.status}.`,
        date: r.updatedAt,
      });
    }
  });

  attendanceItems.forEach((a) => {
    if (a.checkIn) {
      items.push({
        id: `attendance-${a.id}`,
        message: `Checked in at ${a.checkIn}${a.checkOut ? `, checked out at ${a.checkOut}` : ''} on ${a.date}.`,
        date: a.date,
      });
    }
  });

  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  return res.json(
    items.slice(0, 6).map((i) => ({
      id: i.id,
      message: i.message,
      date: new Date(i.date).toISOString().slice(0, 10),
    }))
  );
});

module.exports = { alerts };
