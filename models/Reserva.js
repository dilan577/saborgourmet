const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clientes',
      key: 'id'
    }
  },
  mesaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'mesas',
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  numeroPersonas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'confirmada',
      'en_curso',
      'completada',
      'cancelada',
      'no_show'
    ),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  motivoCancelacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'id'
    },
    comment: 'Usuario que gestionó la reserva'
  }
}, {
  tableName: 'reservas',
  timestamps: true
});

// ===============================
// ASOCIACIONES
// ===============================
Reserva.associate = (models) => {
  // Reserva → Cliente
  Reserva.belongsTo(models.Cliente, {
    foreignKey: 'clienteId',
    as: 'cliente'
  });

  // Reserva → Mesa
  Reserva.belongsTo(models.Mesa, {
    foreignKey: 'mesaId',
    as: 'mesa'
  });

  // Reserva → Usuario (admin / mesero)
  Reserva.belongsTo(models.Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
};

module.exports = Reserva;
