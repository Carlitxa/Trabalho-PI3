const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  contactName: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
}, {
  timestamps: true
});

module.exports = Company;
