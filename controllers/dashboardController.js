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
       DASHBOARD CLIENTE (INNER JOIN REAL ✔)
    ====================================================== */
    if (rol === 'cliente') {

      const misReservas = await Reserva.findAll({
        where: { usuarioId }, // 🔑 RELACIÓN REAL
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Mesa, as: 'mesa', required: false }
        ],
        order: [['fecha', 'ASC'], ['hora', 'ASC']]
      });

      const proximaReserva = misReservas.find(
        r => r.fecha >= hoy
      ) || null;

      return res.render('clientes/dashboard', {

        titulo: 'Mi Dashboard',
        misReservas,
        totalReservas: misReservas.length,
        proximaReserva
      });
    }

    /* ======================================================
       ADMIN → REDIRIGE (NO SE RENDERIZA AQUÍ)
    ====================================================== */
    if (rol === 'admin') {
      return res.redirect('/admin');
    }

    /* ======================================================
       DASHBOARD MESERO
    ====================================================== */

    const reservasHoy = await Reserva.findAll({
      where: { fecha: hoy },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Mesa, as: 'mesa', required: false }
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
    const mesasDisponibles = mesas.filter(m => m.activa === true);
    const mesasOcupadas = mesas.filter(m => m.activa === false);
    const totalMesas = mesas.length;

    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0, 8);
    const horaLimite = new Date(
      ahora.getTime() + 2 * 60 * 60 * 1000
    ).toTimeString().slice(0, 8);

    const reservasProximas = await Reserva.findAll({
      where: {
        fecha: hoy,
        hora: { [Op.between]: [horaActual, horaLimite] }
      },
      include: [{ model: Cliente, as: 'cliente' }],
      order: [['hora', 'ASC']]
    });

    return res.render('dashboard/index', {
      titulo: 'Dashboard',
      reservasHoy,
      reservasProximas,
      totalReservasHoy,
      reservasPendientes,
      reservasConfirmadas,
      mesasDisponibles,
      mesasOcupadas,
      totalMesas
    });

  } catch (error) {
    console.error('❌ Error Dashboard:', error);
    next(error);
  }
};
