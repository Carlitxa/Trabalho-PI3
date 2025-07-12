const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Proposal = sequelize.define('Proposal', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('emprego', 'estágio', 'outra'), allowNull: false },
  candidateProfile: { type: DataTypes.STRING }, // Áreas dos departamentos
  location: { type: DataTypes.STRING },
  deadline: { type: DataTypes.DATE },
  contractType: { type: DataTypes.STRING },
  technicalSkills: { type: DataTypes.STRING },
  softSkills: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  contactName: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  companyId: { type: DataTypes.INTEGER }, // FK para Company
  status: { type: DataTypes.ENUM('pendente', 'inativa', 'removida', 'ocupada' , 'disponivel'), defaultValue: 'disponivel' },
}, {
  timestamps: true
});

module.exports = Proposal;
