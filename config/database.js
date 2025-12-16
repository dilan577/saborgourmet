require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
// Allow empty string password but distinguish undefined
const DB_PASSWORD = Object.prototype.hasOwnProperty.call(process.env, 'DB_PASSWORD')
  ? process.env.DB_PASSWORD
  : undefined;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

if (!DB_NAME || !DB_USER) {
  throw new Error('Faltan variables de entorno: DB_NAME y/o DB_USER');
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  timezone: '-05:00',
  define: {
    timestamps: true,
    underscored: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Sequelize: conexión a la DB OK');
  } catch (err) {
    console.error('Sequelize: error conexión:', err.message || err);
    throw err;
  }
}

// Attach helper to maintain backward compatibility (require('../config/database') returns the sequelize instance)
sequelize.testConnection = testConnection;

module.exports = sequelize;
