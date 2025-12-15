const { Cliente, Reserva, Usuario } = require('../../models');

exports.index = async (req, res) => {
  try {
    const usuarioId = req.session.usuarioId;

    // Usuario real desde BD
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).render('error', {
        titulo: 'Error',
        mensaje: 'Usuario no encontrado'
      });
    }

    // Cliente ligado al usuario
    let cliente = await Cliente.findOne({
      where: { usuarioId }
    });

    // Si no existe, se crea
    if (!cliente) {
      cliente = await Cliente.create({
        usuarioId: usuario.id,
        nombre: usuario.nombre || 'Cliente',
        apellido: usuario.apellido || '',
        email: usuario.email,
        telefono: '',
        noShows: 0,
        bloqueado: false
      });
    }

    const reservas = await Reserva.findAll({
      where: { clienteId: cliente.id },
      order: [['fecha', 'DESC']]
    });

    res.render('clientes/dashboard', {
      titulo: 'Mi Dashboard',
      cliente,
      reservas
    });

  } catch (error) {
    console.error('ERROR DASHBOARD CLIENTE:', error);
    res.status(500).render('error', {
      titulo: '500',
      mensaje: 'Error al cargar el dashboard del cliente'
    });
  }
};
