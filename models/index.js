const sequelize = require('../config/database');

const Usuario = require('./Usuario');
const Mesa = require('./Mesa');
const Horario = require('./Horario');
const Cliente = require('./Cliente');
const Reserva = require('./Reserva');

/* ======================================================
   DEFINIR RELACIONES CON associate
====================================================== */

// 🔹 Reserva → Cliente
Reserva.associate = (models) => {
  Reserva.belongsTo(models.Cliente, {
    foreignKey: 'clienteId',
    as: 'cliente'
  });

  Reserva.belongsTo(models.Mesa, {
    foreignKey: 'mesaId',
    as: 'mesa'
  });

  Reserva.belongsTo(models.Usuario, {
    foreignKey: 'usuarioId',
    as: 'usuario'
  });
};

// 🔹 Cliente → Reservas
Cliente.associate = (models) => {
  Cliente.hasMany(models.Reserva, {
    foreignKey: 'clienteId',
    as: 'reservas'
  });
};

// 🔹 Mesa → Reservas
Mesa.associate = (models) => {
  Mesa.hasMany(models.Reserva, {
    foreignKey: 'mesaId',
    as: 'reservas'
  });
};

// 🔹 Usuario → Reservas gestionadas
Usuario.associate = (models) => {
  Usuario.hasMany(models.Reserva, {
    foreignKey: 'usuarioId',
    as: 'reservasGestionadas'
  });
};

/* ======================================================
   REGISTRAR MODELOS
====================================================== */

const db = {
  sequelize,
  Usuario,
  Mesa,
  Horario,
  Cliente,
  Reserva
};

/* ======================================================
   EJECUTAR associate AUTOMÁTICAMENTE
====================================================== */

Object.values(db).forEach((model) => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;
