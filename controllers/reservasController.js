const { Reserva, Mesa, Cliente, Usuario, Horario } = require('../models');
const { Op } = require('sequelize');

/* ======================================================
   HELPERS
====================================================== */
const obtenerDiaSemana = (fecha) => {
  const dias = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  return dias[new Date(fecha).getDay()];
};

const esFechaPasada = (fecha) => {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  return new Date(fecha) < hoy;
};

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

    res.render('reservas/index', { titulo: 'Reservas', reservas });
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
      if (!cliente || cliente.bloqueado) {
        return res.status(403).render('error', {
          titulo: 'Acceso denegado',
          mensaje: 'Cliente bloqueado o no válido'
        });
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
      order: [['nombre','ASC']]
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

    /* ❌ FECHAS PASADAS */
    if (esFechaPasada(fecha)) {
      return res.status(400).render('error', {
        titulo: 'Error',
        mensaje: 'No se pueden crear reservas en fechas pasadas'
      });
    }

    /* ❌ VALIDAR HORARIO */
    const diaSemana = obtenerDiaSemana(fecha);
    const horarioValido = await Horario.findOne({
      where: {
        diaSemana,
        activo: true,
        horaInicio: { [Op.lte]: hora },
        horaFin: { [Op.gt]: hora }
      }
    });

    if (!horarioValido) {
      return res.status(400).render('error', {
        titulo: 'Error',
        mensaje: 'Hora fuera del horario del restaurante'
      });
    }

    /* ❌ MESA OCUPADA */
    if (mesaId) {
      const existe = await Reserva.findOne({
        where: {
          mesaId,
          fecha,
          hora,
          estado: { [Op.in]: ['pendiente','confirmada','en_curso'] }
        }
      });

      if (existe) {
        return res.status(400).render('error', {
          titulo: 'Error',
          mensaje: 'La mesa ya está reservada en ese horario'
        });
      }
    }

    const data = {
      fecha,
      hora,
      numeroPersonas,
      mesaId: mesaId || null,
      notas: notas || null,
      estado: 'pendiente'
    };

    /* CLIENTE */
    if (rol === 'cliente') {
      const cliente = await Cliente.findOne({ where: { usuarioId } });
      if (!cliente || cliente.bloqueado) {
        return res.status(403).render('error', {
          titulo: 'Error',
          mensaje: 'Cliente bloqueado o inválido'
        });
      }
      data.clienteId = cliente.id;
    } else {
      data.clienteId = req.body.clienteId;
    }

    await Reserva.create(data);
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
      return res.status(404).render('error', {
        titulo: 'Error',
        mensaje: 'Reserva no encontrada'
      });
    }

    if (req.session.rol === 'cliente') {
      const cliente = await Cliente.findOne({
        where: { usuarioId: req.session.usuarioId }
      });

      if (!cliente || reserva.clienteId !== cliente.id) {
        return res.status(403).render('error', {
          titulo: '403',
          mensaje: 'No tienes permiso para ver esta reserva'
        });
      }
    }

    res.render('reservas/ver', { titulo: 'Reserva', reserva });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   CONTROL DE ESTADOS (FLUJO VÁLIDO)
====================================================== */
const cambiarEstado = async (id, estadoActual, nuevoEstado) => {
  const flujos = {
    pendiente: ['confirmada','cancelada'],
    confirmada: ['en_curso','no_show','cancelada'],
    en_curso: ['completada'],
  };
  return flujos[estadoActual]?.includes(nuevoEstado);
};

const actualizarEstado = async (req, res, nuevoEstado, extra = {}) => {
  const reserva = await Reserva.findByPk(req.params.id);
  if (!reserva || !cambiarEstado(reserva.id, reserva.estado, nuevoEstado)) {
    return res.status(400).json({ success: false });
  }

  await reserva.update({ estado: nuevoEstado, ...extra });
  res.json({ success: true });
};

const confirmarReserva = (req, res) =>
  actualizarEstado(req, res, 'confirmada');

const marcarEnCurso = (req, res) =>
  actualizarEstado(req, res, 'en_curso');

const completarReserva = (req, res) =>
  actualizarEstado(req, res, 'completada');

const cancelarReserva = (req, res) =>
  actualizarEstado(req, res, 'cancelada', { motivoCancelacion: req.body.motivo || null });

const marcarNoShow = async (req, res) => {
  const reserva = await Reserva.findByPk(req.params.id, { include: Cliente });
  if (!reserva) return res.json({ success: false });

  await reserva.update({ estado: 'no_show' });
  await reserva.cliente.increment('noShows');

  if (reserva.cliente.noShows + 1 >= 3) {
    await reserva.cliente.update({ bloqueado: true });
  }

  res.json({ success: true });
};

module.exports = {
  listarReservas,
  mostrarFormularioCrear,
  crearReserva,
  verReserva,
  confirmarReserva,
  marcarEnCurso,
  completarReserva,
  cancelarReserva,
  marcarNoShow
};
