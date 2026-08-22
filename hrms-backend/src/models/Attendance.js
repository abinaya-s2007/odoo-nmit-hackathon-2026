const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkIn: DataTypes.STRING, // stored as "HH:MM" for simple display
  checkOut: DataTypes.STRING,
  workHours: DataTypes.FLOAT,
  extraHours: DataTypes.FLOAT,
  status: {
    type: DataTypes.STRING, // Present / Absent / On Leave
    defaultValue: 'Present',
  },
}, {
  indexes: [{ unique: true, fields: ['userId', 'date'] }],
});

module.exports = Attendance;
