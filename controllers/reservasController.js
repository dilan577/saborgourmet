const { Reserva, Mesa, Cliente, Horario } = require('../models');
const { Op } = require('sequelize');

/* ======================================================
   VALIDAR RESERVA
====================================================== */
const validarReserva = async ({ fecha, hora, numeroPersonas, mesaId }) => {
  const fechaHoraReserva = new Date(`${fecha}T${hora}:00`);
  const ahora = new Date();

  if (fechaHoraReserva < ahora) {
    throw new Error('La fecha y hora seleccionadas ya pasaron');
  }

  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = dias[fechaHoraReserva.getDay()];

  const horario = await Horario.findOne({
    where: {
      diaSemana,
      activo: true,
      horaInicio: { [Op.lte]: hora },
      horaFin: { [Op.gt]: hora }
    }
  });

  if (!horario) {
    throw new Error('Hora fuera del horario del restaurante');
  }

  const mesa = await Mesa.findByPk(mesaId);
  if (!mesa || !mesa.activa) {
    throw new Error('Mesa no válida');
  }

  if (parseInt(numeroPersonas) > mesa.capacidad) {
    throw new Error(`La mesa solo permite ${mesa.capacidad} personas`);
  }

  const existe = await Reserva.findOne({
    where: {
      mesaId,
      fecha,
      hora,
      estado: { [Op.notIn]: ['cancelada', 'no_show'] }
    }
  });

  if (existe) {
    throw new Error('La mesa ya está reservada para esa fecha y hora');
  }
};

/* ======================================================
   LISTAR RESERVAS
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
   FORMULARIO CREAR
====================================================== */
const mostrarFormularioCrear = async (req, res, next) => {
  try {
    const mesas = await Mesa.findAll({ where: { activa: true } });

    res.render('reservas/crear', {
      titulo: 'Crear Reserva',
      mesas
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
    const { fecha, hora, numeroPersonas, mesaId, notas, esPublica } = req.body;
    const esReservaPublica = esPublica === '1';

    if (!fecha || !hora || !numeroPersonas || !mesaId) {
      throw new Error('Todos los campos son obligatorios');
    }

    await validarReserva({ fecha, hora, numeroPersonas, mesaId });

    let clienteId;

    if (esReservaPublica) {
      let cliente = await Cliente.findOne({
        where: { email: 'publico@saborgourmet.com' }
      });

      if (!cliente) {
        cliente = await Cliente.create({
          nombre: 'Cliente',
          apellido: 'Público',
          email: 'publico@saborgourmet.com',
          telefono: '000'
        });
      }

      clienteId = cliente.id;
    } else {
      const cliente = await Cliente.findOne({
        where: { usuarioId: req.session.usuarioId }
      });

      if (!cliente) throw new Error('Cliente no encontrado');
      clienteId = cliente.id;
    }

    await Reserva.create({
      clienteId,
      mesaId,
      fecha,
      hora,
      numeroPersonas,
      notas: notas || null,
      estado: 'pendiente'
    });

    if (esReservaPublica) {
      return res.redirect('/?ok=Reserva creada correctamente');
    }

    res.redirect('/dashboard');
  } catch (error) {
    if (req.body.esPublica === '1') {
      return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
    }
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

    res.render('reservas/ver', {
      titulo: 'Reserva',
      reserva
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   CAMBIOS DE ESTADO (ADMIN / MESERO)
====================================================== */
const confirmarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ success: false });

    reserva.estado = 'confirmada';
    await reserva.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ success: false });

    reserva.estado = 'cancelada';
    reserva.motivoCancelacion = req.body.motivoCancelacion || null;
    await reserva.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const marcarEnCurso = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ success: false });

    reserva.estado = 'en_curso';
    await reserva.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

const completarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ success: false });

    reserva.estado = 'completada';
    await reserva.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

const marcarNoShow = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ success: false });

    reserva.estado = 'no_show';
    await reserva.save();

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ======================================================
   EXPORTS (ÚNICO Y CORRECTO)
====================================================== */
module.exports = {
  crearReserva,
  listarReservas,
  mostrarFormularioCrear,
  verReserva,
  confirmarReserva,
  cancelarReserva,
  marcarEnCurso,
  completarReserva,
  marcarNoShow
};
