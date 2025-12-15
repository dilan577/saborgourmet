const { Mesa } = require('../models');

// Listar todas las mesas
const listarMesas = async (req, res) => {
  try {
    const mesas = await Mesa.findAll({
      order: [['numero', 'ASC']]
    });
    
    res.render('mesas/index', {
      titulo: 'Gestión de Mesas',
      mesas
    });
  } catch (error) {
    console.error('Error al listar mesas:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar las mesas',
      error
    });
  }
};

// Mostrar formulario de crear mesa
const mostrarFormularioCrear = (req, res) => {
  res.render('mesas/crear', {
    titulo: 'Crear Mesa',
    error: null
  });
};

// Crear nueva mesa
const crearMesa = async (req, res) => {
  try {
    const { numero, capacidad, zona, descripcion } = req.body;
    
    // Validar campos
    if (!numero || !capacidad || !zona) {
      return res.render('mesas/crear', {
        titulo: 'Crear Mesa',
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }
    
    // Validar capacidad
    if (capacidad < 1 || capacidad > 20) {
      return res.render('mesas/crear', {
        titulo: 'Crear Mesa',
        error: 'La capacidad debe estar entre 1 y 20 personas'
      });
    }
    
    // Verificar si el número de mesa ya existe
    const mesaExistente = await Mesa.findOne({ where: { numero } });
    
    if (mesaExistente) {
      return res.render('mesas/crear', {
        titulo: 'Crear Mesa',
        error: 'Ya existe una mesa con ese número'
      });
    }
    
    // Crear mesa
    await Mesa.create({
      numero,
      capacidad,
      zona,
      descripcion,
      activa: true
    });
    
    res.redirect('/mesas?mensaje=Mesa creada exitosamente');
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.render('mesas/crear', {
      titulo: 'Crear Mesa',
      error: 'Error al crear la mesa. Intente nuevamente'
    });
  }
};

// Mostrar formulario de editar mesa
const mostrarFormularioEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.redirect('/mesas?error=Mesa no encontrada');
    }
    
    res.render('mesas/editar', {
      titulo: 'Editar Mesa',
      mesa,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar mesa:', error);
    res.redirect('/mesas?error=Error al cargar la mesa');
  }
};

// Actualizar mesa
const actualizarMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, capacidad, zona, descripcion } = req.body;
    
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.redirect('/mesas?error=Mesa no encontrada');
    }
    
    // Validar campos
    if (!numero || !capacidad || !zona) {
      return res.render('mesas/editar', {
        titulo: 'Editar Mesa',
        mesa,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }
    
    // Validar capacidad
    if (capacidad < 1 || capacidad > 20) {
      return res.render('mesas/editar', {
        titulo: 'Editar Mesa',
        mesa,
        error: 'La capacidad debe estar entre 1 y 20 personas'
      });
    }
    
    // Verificar si el número de mesa ya existe (excepto la actual)
    const mesaExistente = await Mesa.findOne({ 
      where: { 
        numero,
        id: { [require('sequelize').Op.ne]: id }
      } 
    });
    
    if (mesaExistente) {
      return res.render('mesas/editar', {
        titulo: 'Editar Mesa',
        mesa,
        error: 'Ya existe otra mesa con ese número'
      });
    }
    
    // Actualizar mesa
    await mesa.update({
      numero,
      capacidad,
      zona,
      descripcion
    });
    
    res.redirect('/mesas?mensaje=Mesa actualizada exitosamente');
  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    const mesa = await Mesa.findByPk(req.params.id);
    res.render('mesas/editar', {
      titulo: 'Editar Mesa',
      mesa,
      error: 'Error al actualizar la mesa. Intente nuevamente'
    });
  }
};

// Activar/Desactivar mesa
const toggleEstadoMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    
    await mesa.update({ activa: !mesa.activa });
    
    res.json({ 
      success: true, 
      mensaje: `Mesa ${mesa.activa ? 'activada' : 'desactivada'} exitosamente`,
      activa: mesa.activa
    });
  } catch (error) {
    console.error('Error al cambiar estado de mesa:', error);
    res.status(500).json({ error: 'Error al cambiar estado de la mesa' });
  }
};

// Eliminar mesa
const eliminarMesa = async (req, res) => {
  try {
    const { id } = req.params;
    const mesa = await Mesa.findByPk(id);
    
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    
    await mesa.destroy();
    
    res.json({ success: true, mensaje: 'Mesa eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({ error: 'Error al eliminar la mesa' });
  }
};

module.exports = {
  listarMesas,
  mostrarFormularioCrear,
  crearMesa,
  mostrarFormularioEditar,
  actualizarMesa,
  toggleEstadoMesa,
  eliminarMesa
};
