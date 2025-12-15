const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mesa = sequelize.define('Mesa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  },
  capacidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 20
    }
  },
  zona: {
    type: DataTypes.ENUM('terraza', 'interior', 'vip', 'exterior'),
    allowNull: false,
    defaultValue: 'interior'
  },
  activa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'mesas',
  timestamps: true
});

module.exports = Mesa;
