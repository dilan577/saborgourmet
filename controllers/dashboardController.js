const { Reserva, Mesa, Cliente } = require('../models');
const { Op } = require('sequelize');

exports.index = async (req, res, next) => {
  try {
    const { rol, usuarioId } = req.session;

    if (!usuarioId) {
      return res.redirect('/auth/login');
    }

    const hoy = new Date().toISOString().slice(0, 10);

    /* ======================================================
       DASHBOARD CLIENTE
    ====================================================== */
    if (rol === 'cliente') {

      // 🔑 Obtener cliente real
      const cliente = await Cliente.findOne({
        where: { usuarioId }
      });

      if (!cliente) {
        return res.redirect('/auth/login');
      }

      const misReservas = await Reserva.findAll({
        where: { clienteId: cliente.id },
        include: [
          { model: Mesa, as: 'mesa' }
        ],
        order: [['fecha', 'ASC'], ['hora', 'ASC']]
      });

      const proximaReserva =
        misReservas.find(r => r.fecha >= hoy) || null;

      return res.render('clientes/dashboard', {
        titulo: 'Mi Dashboard',
        misReservas,
        totalReservas: misReservas.length,
        proximaReserva
      });
    }

    /* ======================================================
       ADMIN → REDIRECCIÓN
    ====================================================== */
    if (rol === 'admin') {
      return res.redirect('/admin');
    }

    /* ======================================================
       DASHBOARD MESERO
    ====================================================== */
    if (rol === 'mesero') {

      const reservasHoy = await Reserva.findAll({
        where: { fecha: hoy },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Mesa, as: 'mesa' }
        ],
        order: [['hora', 'ASC']]
      });

      const totalReservasHoy = reservasHoy.length;
      const reservasPendientes = reservasHoy.filter(
        r => r.estado === 'pendiente'
      ).length;
      const reservasConfirmadas = reservasHoy.filter(
        r => r.estado === 'confirmada'
      ).length;

      const mesas = await Mesa.findAll();
      const totalMesas = mesas.length;

      // 🕒 Hora actual HH:MM
      const ahora = new Date();
      const horaActual = ahora.toTimeString().slice(0, 5);
      const horaLimite = new Date(
        ahora.getTime() + 2 * 60 * 60 * 1000
      ).toTimeString().slice(0, 5);

      const reservasProximas = await Reserva.findAll({
        where: {
          fecha: hoy,
          hora: { [Op.between]: [horaActual, horaLimite] }
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Mesa, as: 'mesa' }
        ],
        order: [['hora', 'ASC']]
      });

      return res.render('dashboard/index', {
        titulo: 'Dashboard Mesero',
        reservasHoy,
        reservasProximas,
        totalReservasHoy,
        reservasPendientes,
        reservasConfirmadas,
        totalMesas
      });
    }

    // 🔐 Rol no permitido
    return res.redirect('/auth/login');

  } catch (error) {
    console.error('❌ Error Dashboard:', error);
    next(error);
  }
};
