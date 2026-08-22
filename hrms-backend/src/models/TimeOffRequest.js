const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TimeOffRequest = sequelize.define('TimeOffRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // 'Paid time off' | 'Sick Leave' | 'Unpaid Leaves'
    allowNull: false,
  },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  allocationDays: { type: DataTypes.FLOAT, defaultValue: 1 },
  remarks: DataTypes.STRING,
  attachmentUrl: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  comment: DataTypes.STRING,
});

module.exports = TimeOffRequest;
