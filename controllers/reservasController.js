const { Reserva, Mesa, Cliente, Horario } = require('../models');
const { Op } = require('sequelize');

const crearReserva = async (req, res, next) => {
  try {
    const { rol, usuarioId } = req.session;
    const { fecha, hora, numeroPersonas, mesaId, notas } = req.body;

    // ===============================
    // 1️⃣ FECHA NO PASADA
    // ===============================
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaReserva = new Date(fecha);
    if (fechaReserva < hoy) {
      return res.render('error', {
        mensaje: 'No se pueden crear reservas en fechas pasadas'
      });
    }

    // ===============================
    // 2️⃣ HORARIO DEL RESTAURANTE
    // ===============================
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
        mensaje: 'La hora seleccionada está fuera del horario del restaurante'
      });
    }

    // ===============================
    // 3️⃣ VALIDAR MESA
    // ===============================
    const mesa = await Mesa.findByPk(mesaId);
    if (!mesa || !mesa.activa) {
      return res.render('error', {
        mensaje: 'Mesa no válida'
      });
    }

    // ===============================
    // 4️⃣ CAPACIDAD DE MESA
    // ===============================
    if (numeroPersonas > mesa.capacidad) {
      return res.render('error', {
        mensaje: `La mesa seleccionada solo permite ${mesa.capacidad} personas`
      });
    }

    // ===============================
    // 5️⃣ MESA NO DOBLE RESERVA
    // ===============================
    const existeReserva = await Reserva.findOne({
      where: {
        mesaId,
        fecha,
        hora,
        estado: {
          [Op.notIn]: ['cancelada', 'no_show']
        }
      }
    });

    if (existeReserva) {
      return res.render('error', {
        mensaje: 'Esta mesa ya tiene una reserva en ese horario'
      });
    }

    // ===============================
    // 6️⃣ CLIENTE SEGÚN ROL
    // ===============================
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

    // ===============================
    // 7️⃣ CREAR RESERVA
    // ===============================
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
