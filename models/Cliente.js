const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  noShows: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Contador de reservas no presentadas'
  },
  bloqueado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'clientes',
  timestamps: true
});

// ===============================
// ASOCIACIONES
// ===============================
Cliente.associate = (models) => {
  // Cliente → Reservas
  Cliente.hasMany(models.Reserva, {
    foreignKey: 'clienteId',
    as: 'reservas'
  });

  // Cliente → Usuario (por email)
  Cliente.belongsTo(models.Usuario, {
    foreignKey: 'email',
    targetKey: 'email'
  });
};

module.exports = Cliente;
