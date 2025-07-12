// db.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('myappdb', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres',
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to PostgreSQL has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;
