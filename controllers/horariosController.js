const { Horario } = require('../models');

// Listar todos los horarios
const listarHorarios = async (req, res) => {
  try {
    const horarios = await Horario.findAll({
      order: [
        ['diaSemana', 'ASC'],
        ['horaInicio', 'ASC']
      ]
    });
    
    // Agrupar por día
    const horariosPorDia = {
      lunes: [],
      martes: [],
      miercoles: [],
      jueves: [],
      viernes: [],
      sabado: [],
      domingo: []
    };
    
    horarios.forEach(horario => {
      horariosPorDia[horario.diaSemana].push(horario);
    });
    
    res.render('horarios/index', {
      titulo: 'Gestión de Horarios',
      horariosPorDia
    });
  } catch (error) {
    console.error('Error al listar horarios:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar los horarios',
      error
    });
  }
};

// Mostrar formulario de crear horario
const mostrarFormularioCrear = (req, res) => {
  res.render('horarios/crear', {
    titulo: 'Crear Horario',
    error: null
  });
};

// Crear nuevo horario
const crearHorario = async (req, res) => {
  try {
    const { diaSemana, horaInicio, horaFin, intervaloReserva, duracionEstandar } = req.body;
    
    // Validar campos
    if (!diaSemana || !horaInicio || !horaFin || !intervaloReserva || !duracionEstandar) {
      return res.render('horarios/crear', {
        titulo: 'Crear Horario',
        error: 'Todos los campos son obligatorios'
      });
    }
    
    // Validar que hora fin sea mayor que hora inicio
    if (horaInicio >= horaFin) {
      return res.render('horarios/crear', {
        titulo: 'Crear Horario',
        error: 'La hora de fin debe ser mayor que la hora de inicio'
      });
    }
    
    // Crear horario
    await Horario.create({
      diaSemana,
      horaInicio,
      horaFin,
      intervaloReserva,
      duracionEstandar,
      activo: true
    });
    
    res.redirect('/horarios?mensaje=Horario creado exitosamente');
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.render('horarios/crear', {
      titulo: 'Crear Horario',
      error: 'Error al crear el horario. Intente nuevamente'
    });
  }
};

// Mostrar formulario de editar horario
const mostrarFormularioEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findByPk(id);
    
    if (!horario) {
      return res.redirect('/horarios?error=Horario no encontrado');
    }
    
    res.render('horarios/editar', {
      titulo: 'Editar Horario',
      horario,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar horario:', error);
    res.redirect('/horarios?error=Error al cargar el horario');
  }
};

// Actualizar horario
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { diaSemana, horaInicio, horaFin, intervaloReserva, duracionEstandar } = req.body;
    
    const horario = await Horario.findByPk(id);
    
    if (!horario) {
      return res.redirect('/horarios?error=Horario no encontrado');
    }
    
    // Validar campos
    if (!diaSemana || !horaInicio || !horaFin || !intervaloReserva || !duracionEstandar) {
      return res.render('horarios/editar', {
        titulo: 'Editar Horario',
        horario,
        error: 'Todos los campos son obligatorios'
      });
    }
    
    // Validar que hora fin sea mayor que hora inicio
    if (horaInicio >= horaFin) {
      return res.render('horarios/editar', {
        titulo: 'Editar Horario',
        horario,
        error: 'La hora de fin debe ser mayor que la hora de inicio'
      });
    }
    
    // Actualizar horario
    await horario.update({
      diaSemana,
      horaInicio,
      horaFin,
      intervaloReserva,
      duracionEstandar
    });
    
    res.redirect('/horarios?mensaje=Horario actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    const horario = await Horario.findByPk(req.params.id);
    res.render('horarios/editar', {
      titulo: 'Editar Horario',
      horario,
      error: 'Error al actualizar el horario. Intente nuevamente'
    });
  }
};

// Activar/Desactivar horario
const toggleEstadoHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findByPk(id);
    
    if (!horario) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    await horario.update({ activo: !horario.activo });
    
    res.json({ 
      success: true, 
      mensaje: `Horario ${horario.activo ? 'activado' : 'desactivado'} exitosamente`,
      activo: horario.activo
    });
  } catch (error) {
    console.error('Error al cambiar estado de horario:', error);
    res.status(500).json({ error: 'Error al cambiar estado del horario' });
  }
};

// Eliminar horario
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const horario = await Horario.findByPk(id);
    
    if (!horario) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    await horario.destroy();
    
    res.json({ success: true, mensaje: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ error: 'Error al eliminar el horario' });
  }
};

module.exports = {
  listarHorarios,
  mostrarFormularioCrear,
  crearHorario,
  mostrarFormularioEditar,
  actualizarHorario,
  toggleEstadoHorario,
  eliminarHorario
};
