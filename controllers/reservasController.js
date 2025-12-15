const { Reserva, Mesa, Cliente, Horario } = require('../models');
const { Op } = require('sequelize');

/* ======================================================
   LISTAR RESERVAS (ADMIN / MESERO)
====================================================== */
const listarReservas = async (req, res, next) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Mesa, as: 'mesa' },
        { model: Cliente, as: 'cliente' }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    res.render('reservas/index', {
      titulo: 'Reservas',
      reservas
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   FORMULARIO CREAR RESERVA
====================================================== */
const mostrarFormularioCrear = async (req, res, next) => {
  try {
    const { rol, usuarioId } = req.session;
    const mesas = await Mesa.findAll({ where: { activa: true } });

    if (rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuarioId } });
      if (!cliente) {
        return res.render('error', { mensaje: 'Cliente no encontrado' });
      }

      return res.render('reservas/crear', {
        titulo: 'Crear Reserva',
        mesas,
        clienteLogueado: cliente,
        clientes: null
      });
    }

    const clientes = await Cliente.findAll({
      where: { bloqueado: false },
      order: [['nombre', 'ASC']]
    });

    res.render('reservas/crear', {
      titulo: 'Crear Reserva',
      mesas,
      clientes,
      clienteLogueado: null
    });

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   CREAR RESERVA (VALIDACIONES COMPLETAS)
====================================================== */
const crearReserva = async (req, res, next) => {
  try {
    const { rol, usuarioId } = req.session;
    const { fecha, hora, numeroPersonas, mesaId, notas } = req.body;

    /* ===============================
       FECHA NO PASADA
    =============================== */
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(fecha);
    if (fechaReserva < hoy) {
      return res.render('error', { mensaje: 'No se permiten fechas pasadas' });
    }

    /* ===============================
       HORARIO VÁLIDO
    =============================== */
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = dias[fechaReserva.getDay()];

    const horario = await Horario.findOne({
      where: {
        diaSemana,
        activo: true,
        horaInicio: { [Op.lte]: hora },
        horaFin: { [Op.gt]: hora }
      }
    });

    if (!horario) {
      return res.render('error', {
        mensaje: 'Hora fuera del horario del restaurante'
      });
    }

    /* ===============================
       MESA Y CAPACIDAD
    =============================== */
    const mesa = await Mesa.findByPk(mesaId);
    if (!mesa || !mesa.activa) {
      return res.render('error', { mensaje: 'Mesa inválida' });
    }

    if (numeroPersonas > mesa.capacidad) {
      return res.render('error', {
        mensaje: `La mesa solo permite ${mesa.capacidad} personas`
      });
    }

    /* ===============================
       NO DOBLE RESERVA
    =============================== */
    const existeReserva = await Reserva.findOne({
      where: {
        mesaId,
        fecha,
        hora,
        estado: { [Op.notIn]: ['cancelada', 'no_show'] }
      }
    });

    if (existeReserva) {
      return res.render('error', {
        mensaje: 'La mesa ya está reservada en ese horario'
      });
    }

    /* ===============================
       CLIENTE
    =============================== */
    let clienteId;

    if (rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuarioId } });
      if (!cliente) {
        return res.render('error', { mensaje: 'Cliente no encontrado' });
      }
      clienteId = cliente.id;
    } else {
      clienteId = req.body.clienteId;
    }

    /* ===============================
       CREAR
    =============================== */
    await Reserva.create({
      clienteId,
      mesaId,
      fecha,
      hora,
      numeroPersonas,
      notas: notas || null,
      estado: 'pendiente'
    });

    res.redirect('/dashboard');

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   VER RESERVA
====================================================== */
const verReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [
        { model: Mesa, as: 'mesa' },
        { model: Cliente, as: 'cliente' }
      ]
    });

    if (!reserva) {
      return res.render('error', { mensaje: 'Reserva no encontrada' });
    }

    res.render('reservas/ver', {
      titulo: 'Reserva',
      reserva
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   EXPORTS (UNO SOLO, LIMPIO)
====================================================== */
module.exports = {
  listarReservas,
  mostrarFormularioCrear,
  crearReserva,
  verReserva
};
