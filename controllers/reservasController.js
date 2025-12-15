const { Reserva, Mesa, Cliente, Usuario } = require('../models');

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

    /* ======================
       CLIENTE
    ====================== */
    if (rol === 'cliente') {
      const cliente = await Cliente.findOne({
        where: { usuarioId }
      });

      if (!cliente) {
        return res.status(404).render('error', {
          titulo: 'Error',
          mensaje: 'Cliente no encontrado'
        });
      }

      return res.render('reservas/crear', {
        titulo: 'Crear Reserva',
        mesas,
        clienteLogueado: cliente,
        clientes: null
      });
    }

    /* ======================
       ADMIN / MESERO
    ====================== */
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
   CREAR RESERVA
====================================================== */
const crearReserva = async (req, res, next) => {
  try {
    const { rol, usuarioId } = req.session;

    const data = {
      fecha: req.body.fecha,
      hora: req.body.hora,
      numeroPersonas: req.body.numeroPersonas,
      mesaId: req.body.mesaId || null,
      notas: req.body.notas || null,
      estado: 'pendiente'
    };

    /* ======================
       CLIENTE
    ====================== */
    if (rol === 'cliente') {
      const cliente = await Cliente.findOne({
        where: { usuarioId }
      });

      if (!cliente) {
        return res.status(404).render('error', {
          titulo: 'Error',
          mensaje: 'Cliente no encontrado'
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
   MESAS DISPONIBLES (AJAX)
====================================================== */
const obtenerMesasDisponibles = async (req, res, next) => {
  try {
    const mesas = await Mesa.findAll({ where: { activa: true } });
    res.json(mesas);
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

    // 🔐 Cliente solo puede ver SU reserva
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

    res.render('reservas/ver', {
      titulo: 'Reserva',
      reserva
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   EDITAR / ACTUALIZAR (ADMIN)
====================================================== */
const mostrarFormularioEditar = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    const mesas = await Mesa.findAll({ where: { activa: true } });

    if (!reserva) {
      return res.redirect('/reservas');
    }

    res.render('reservas/editar', {
      titulo: 'Editar Reserva',
      reserva,
      mesas
    });
  } catch (error) {
    next(error);
  }
};

const actualizarReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.redirect('/reservas');

    await reserva.update(req.body);
    res.redirect(`/reservas/${reserva.id}`);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   ESTADOS (AJAX)
====================================================== */
const confirmarReserva = async (req, res) => {
  await Reserva.update({ estado: 'confirmada' }, { where: { id: req.params.id } });
  res.json({ success: true });
};

const marcarEnCurso = async (req, res) => {
  await Reserva.update({ estado: 'en_curso' }, { where: { id: req.params.id } });
  res.json({ success: true });
};

const completarReserva = async (req, res) => {
  await Reserva.update({ estado: 'completada' }, { where: { id: req.params.id } });
  res.json({ success: true });
};

const cancelarReserva = async (req, res) => {
  await Reserva.update(
    { estado: 'cancelada', motivoCancelacion: req.body.motivo || null },
    { where: { id: req.params.id } }
  );
  res.json({ success: true });
};

const marcarNoShow = async (req, res) => {
  await Reserva.update({ estado: 'no_show' }, { where: { id: req.params.id } });
  res.json({ success: true });
};

module.exports = {
  listarReservas,
  mostrarFormularioCrear,
  crearReserva,
  obtenerMesasDisponibles,
  verReserva,
  mostrarFormularioEditar,
  actualizarReserva,
  confirmarReserva,
  marcarEnCurso,
  completarReserva,
  cancelarReserva,
  marcarNoShow
};
