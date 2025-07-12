const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.UUID, allowNull: false }, // FK para User (UUID)
  proposalId: { type: DataTypes.INTEGER, allowNull: false }, // FK para Proposal
  status: { type: DataTypes.ENUM('pendente', 'aceite', 'rejeitada'), defaultValue: 'pendente' },
}, {
  timestamps: true
});

module.exports = Application;
