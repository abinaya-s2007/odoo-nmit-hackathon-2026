const sequelize = require('../config/db');
const Company = require('./Company');
const User = require('./User');
const Attendance = require('./Attendance');
const TimeOffRequest = require('./TimeOffRequest');

Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.hasMany(Attendance, { foreignKey: 'userId', as: 'attendanceRecords' });
Attendance.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(TimeOffRequest, { foreignKey: 'userId', as: 'timeOffRequests' });
TimeOffRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  Company,
  User,
  Attendance,
  TimeOffRequest,
};
