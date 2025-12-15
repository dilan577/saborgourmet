const { Cliente, Reserva, Mesa } = require('../models');

// Listar todos los clientes
const listarClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{
        model: Reserva,
        as: 'reservas'
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.render('clientes/index', {
      titulo: 'Gestión de Clientes',
      clientes
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);
    res.status(500).render('error', {
      mensaje: 'Error al cargar los clientes',
      error
    });
  }
};

// Mostrar formulario de crear cliente
const mostrarFormularioCrear = (req, res) => {
  res.render('clientes/crear', {
    titulo: 'Registrar Cliente',
    error: null
  });
};

// Crear nuevo cliente
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, notas } = req.body;
    
    // Validar campos
    if (!nombre || !apellido || !email || !telefono) {
      return res.render('clientes/crear', {
        titulo: 'Registrar Cliente',
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }
    
    // Verificar si el email ya existe
    const clienteExistente = await Cliente.findOne({ where: { email } });
    
    if (clienteExistente) {
      return res.render('clientes/crear', {
        titulo: 'Registrar Cliente',
        error: 'Ya existe un cliente con ese email'
      });
    }
    
    // Crear cliente
    await Cliente.create({
      nombre,
      apellido,
      email,
      telefono,
      notas,
      noShows: 0,
      bloqueado: false
    });
    
    res.redirect('/clientes?mensaje=Cliente registrado exitosamente');
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.render('clientes/crear', {
      titulo: 'Registrar Cliente',
      error: 'Error al registrar el cliente. Intente nuevamente'
    });
  }
};

// Ver detalle de cliente con historial
const verCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id, {
      include: [{
        model: Reserva,
        as: 'reservas',
        include: [{ model: Mesa, as: 'mesa' }],
        order: [['fecha', 'DESC'], ['hora', 'DESC']]
      }]
    });
    
    if (!cliente) {
      return res.redirect('/clientes?error=Cliente no encontrado');
    }
    
    // Calcular estadísticas
    const totalReservas = cliente.reservas.length;
    const reservasCompletadas = cliente.reservas.filter(r => r.estado === 'completada').length;
    const reservasCanceladas = cliente.reservas.filter(r => r.estado === 'cancelada').length;
    
    res.render('clientes/ver', {
      titulo: `Cliente: ${cliente.nombre} ${cliente.apellido}`,
      cliente,
      totalReservas,
      reservasCompletadas,
      reservasCanceladas
    });
  } catch (error) {
    console.error('Error al ver cliente:', error);
    res.redirect('/clientes?error=Error al cargar el cliente');
  }
};

// Mostrar formulario de editar cliente
const mostrarFormularioEditar = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.redirect('/clientes?error=Cliente no encontrado');
    }
    
    res.render('clientes/editar', {
      titulo: 'Editar Cliente',
      cliente,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar cliente:', error);
    res.redirect('/clientes?error=Error al cargar el cliente');
  }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, telefono, notas } = req.body;
    
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.redirect('/clientes?error=Cliente no encontrado');
    }
    
    // Validar campos
    if (!nombre || !apellido || !email || !telefono) {
      return res.render('clientes/editar', {
        titulo: 'Editar Cliente',
        cliente,
        error: 'Todos los campos obligatorios deben ser completados'
      });
    }
    
    // Verificar si el email ya existe (excepto el actual)
    const clienteExistente = await Cliente.findOne({ 
      where: { 
        email,
        id: { [require('sequelize').Op.ne]: id }
      } 
    });
    
    if (clienteExistente) {
      return res.render('clientes/editar', {
        titulo: 'Editar Cliente',
        cliente,
        error: 'Ya existe otro cliente con ese email'
      });
    }
    
    // Actualizar cliente
    await cliente.update({
      nombre,
      apellido,
      email,
      telefono,
      notas
    });
    
    res.redirect('/clientes?mensaje=Cliente actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    const cliente = await Cliente.findByPk(req.params.id);
    res.render('clientes/editar', {
      titulo: 'Editar Cliente',
      cliente,
      error: 'Error al actualizar el cliente. Intente nuevamente'
    });
  }
};

// Bloquear/Desbloquear cliente
const toggleBloqueoCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    await cliente.update({ bloqueado: !cliente.bloqueado });
    
    res.json({ 
      success: true, 
      mensaje: `Cliente ${cliente.bloqueado ? 'bloqueado' : 'desbloqueado'} exitosamente`,
      bloqueado: cliente.bloqueado
    });
  } catch (error) {
    console.error('Error al cambiar bloqueo de cliente:', error);
    res.status(500).json({ error: 'Error al cambiar bloqueo del cliente' });
  }
};

module.exports = {
  listarClientes,
  mostrarFormularioCrear,
  crearCliente,
  verCliente,
  mostrarFormularioEditar,
  actualizarCliente,
  toggleBloqueoCliente
};
