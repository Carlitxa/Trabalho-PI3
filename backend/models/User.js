// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,  // Generate UUID automatically
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nomeCompleto: DataTypes.STRING,
  nomeUsuario: DataTypes.STRING,
  nomeEmpresa: DataTypes.STRING,
  enderecoComercial: DataTypes.STRING,
  sobre: DataTypes.TEXT,
  role: DataTypes.STRING,

  // New Field for departamento
  nomeDepartamento: DataTypes.STRING,
  // New fields for students
  formacao: DataTypes.STRING,              // formação que tem ou que está a tirar
  idade: DataTypes.INTEGER,                 // idade
  emailInstitucional: DataTypes.STRING,    // email institucional
  emailPessoal: DataTypes.STRING,          // email pessoal

  // Novos campos para integração com outros models e funcionalidades
  anoConclusao: DataTypes.STRING, // ano ou previsão de conclusão
  areasInteresse: DataTypes.STRING, // áreas de interesse profissional
  competenciasTecnicas: DataTypes.STRING, // competências técnicas
  competenciasSoft: DataTypes.STRING, // soft skills
  companyId: DataTypes.INTEGER, // FK para Company
  departmentId: DataTypes.INTEGER, // FK para Department
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
