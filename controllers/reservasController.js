const { Reserva, Mesa, Cliente, Horario } = require('../models');
const { Op } = require('sequelize');

/* ======================================================
   VALIDAR RESERVA
====================================================== */
const validarReserva = async ({ fecha, hora, numeroPersonas, mesaId }) => {
  // 📅 + ⏰ FECHA Y HORA COMPLETAS (NO PASADAS)
  const fechaHoraReserva = new Date(`${fecha}T${hora}:00`);
  const ahora = new Date();

  if (fechaHoraReserva < ahora) {
    throw new Error('La fecha y hora seleccionadas ya pasaron');
  }

  // 📅 Día de la semana
  const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const diaSemana = dias[fechaHoraReserva.getDay()];

  // ⏰ Horario válido del restaurante
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

  // 🪑 Mesa válida
  const mesa = await Mesa.findByPk(mesaId);
  if (!mesa || !mesa.activa) {
    throw new Error('Mesa no válida');
  }

  // 👥 Capacidad
  if (parseInt(numeroPersonas) > mesa.capacidad) {
    throw new Error(`La mesa solo permite ${mesa.capacidad} personas`);
  }

  // 🚫 MISMA MESA + MISMA FECHA + MISMA HORA
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

  return true;
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

    res.render('reservas/index', {
      titulo: 'Reservas',
      reservas
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   FORMULARIO CREAR (PRIVADO)
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
   CREAR RESERVA (PÚBLICA Y PRIVADA)
====================================================== */
const crearReserva = async (req, res, next) => {
  try {
    const {
      fecha,
      hora,
      numeroPersonas,
      mesaId,
      notas,
      esPublica
    } = req.body;

    const esReservaPublica = esPublica === '1';

    // 🔴 Validación básica
    if (!fecha || !hora || !numeroPersonas || !mesaId) {
      throw new Error('Todos los campos son obligatorios');
    }

    // ✅ VALIDACIÓN CENTRAL
    await validarReserva({
      fecha,
      hora,
      numeroPersonas,
      mesaId
    });

    let clienteId;

    // 🌍 RESERVA PÚBLICA
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
    }
    // 🔐 RESERVA PRIVADA (ADMIN / MESERO / CLIENTE)
    else {
      if (!req.session.usuarioId) {
        throw new Error('Debes iniciar sesión');
      }

      const cliente = await Cliente.findOne({
        where: { usuarioId: req.session.usuarioId }
      });

      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }

      clienteId = cliente.id;
    }

    // 💾 CREAR RESERVA
    await Reserva.create({
      clienteId,
      mesaId,
      fecha,
      hora,
      numeroPersonas,
      notas: notas || null,
      estado: 'pendiente'
    });

    // 🎯 RESPUESTA
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

const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Estados permitidos
    const estadosValidos = ['confirmada', 'atendida', 'cancelada', 'no_show'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    const reserva = await Reserva.findByPk(id);

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    reserva.estado = estado;
    await reserva.save();

    return res.json({ ok: true });

  } catch (error) {
    console.error('❌ Error cambiarEstado:', error);
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};


/* ======================================================
   EXPORTS
====================================================== */
module.exports = {
  listarReservas,
  mostrarFormularioCrear,
  crearReserva,
  cambiarEstado,
  verReserva
};
