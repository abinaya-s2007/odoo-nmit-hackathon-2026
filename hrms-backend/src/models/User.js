const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Auto-generated per the wireframe spec: OI[Initials][Year][Serial]
  loginId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'hr', 'employee'),
    allowNull: false,
    defaultValue: 'employee',
  },
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  dob: DataTypes.DATEONLY,
  avatarUrl: DataTypes.STRING,
  about: DataTypes.TEXT,
  skills: DataTypes.STRING,
  jobTitle: DataTypes.STRING,
  department: DataTypes.STRING,
  joinDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },

  // ---- Salary structure (spec 3.6 / Salary Info tab) ----
  salaryBasic: { type: DataTypes.FLOAT, defaultValue: 0 },
  salaryHra: { type: DataTypes.FLOAT, defaultValue: 0 },
  salaryAllowances: { type: DataTypes.FLOAT, defaultValue: 0 },
  salaryPf: { type: DataTypes.FLOAT, defaultValue: 0 },

  // ---- Time off balances (spec 3.5) ----
  paidLeaveBalance: { type: DataTypes.FLOAT, defaultValue: 24 },
  sickLeaveBalance: { type: DataTypes.FLOAT, defaultValue: 7 },

  mustChangePassword: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = User;
