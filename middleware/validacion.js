const { Mesa, Horario, Reserva } = require('../models');
const { Op } = require('sequelize');

// Validar capacidad de mesa
const validarCapacidadMesa = async (req, res, next) => {
  try {
    const { mesaId, numeroPersonas } = req.body;
    
    if (mesaId) {
      const mesa = await Mesa.findByPk(mesaId);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }
      
      if (!mesa.activa) {
        throw new Error('La mesa no está activa');
      }
      
      if (parseInt(numeroPersonas) > mesa.capacidad) {
        throw new Error(`La mesa solo tiene capacidad para ${mesa.capacidad} personas`);
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en validación de capacidad:', error);
    next(error);
  }
};

// Validar fecha y horario
const validarFechaHorario = async (req, res, next) => {
  try {
    const { fecha, hora } = req.body;
    
    // Validar que la fecha no sea pasada
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaReserva < hoy) {
      throw new Error('No se pueden hacer reservas en fechas pasadas');
    }
    
    // Obtener día de la semana
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = diasSemana[fechaReserva.getDay()];
    
    // Verificar si hay horarios disponibles para ese día
    const horarios = await Horario.findAll({
      where: {
        diaSemana,
        activo: true
      }
    });
    
    if (horarios.length === 0) {
      throw new Error('El restaurante no atiende en ese día');
    }
    
    // Verificar si la hora está dentro de los horarios
    const horaReserva = hora;
    let horarioValido = false;
    
    for (const horario of horarios) {
      if (horaReserva >= horario.horaInicio && horaReserva <= horario.horaFin) {
        horarioValido = true;
        break;
      }
    }
    
    if (!horarioValido) {
      throw new Error('La hora seleccionada no está dentro del horario de atención');
    }
    
    next();
  } catch (error) {
    console.error('Error en validación de fecha/horario:', error);
    next(error);
  }
};

// Validar disponibilidad de mesa
const validarDisponibilidadMesa = async (req, res, next) => {
  try {
    const { mesaId, fecha, hora, id } = req.body;
    
    if (!mesaId) {
      return next();
    }
    
    // Obtener la mesa para la capacidad
    const mesa = await Mesa.findByPk(mesaId);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }
    
    // Buscar reservas existentes para esa mesa en esa fecha y hora
    const whereClause = {
      mesaId,
      fecha,
      estado: {
        [Op.notIn]: ['cancelada', 'completada', 'no_show']
      }
    };
    
    // Si es una edición, excluir la reserva actual
    if (id) {
      whereClause.id = { [Op.ne]: id };
    }
    
    const reservasExistentes = await Reserva.findAll({
      where: whereClause
    });
    
    // Verificar conflictos de horario (2 horas de duración estándar)
    const horaReserva = hora.split(':');
    const minutosReserva = parseInt(horaReserva[0]) * 60 + parseInt(horaReserva[1]);
    
    for (const reserva of reservasExistentes) {
      const horaExistente = reserva.hora.split(':');
      const minutosExistente = parseInt(horaExistente[0]) * 60 + parseInt(horaExistente[1]);
      
      // Verificar si hay solapamiento (120 minutos = 2 horas)
      if (Math.abs(minutosReserva - minutosExistente) < 120) {
        throw new Error('La mesa ya está reservada en ese horario. Por favor, seleccione otra hora o mesa.');
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en validación de disponibilidad:', error);
    next(error);
  }
};

module.exports = {
  validarCapacidadMesa,
  validarFechaHorario,
  validarDisponibilidadMesa
};


