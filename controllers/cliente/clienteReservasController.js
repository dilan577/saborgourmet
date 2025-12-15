const { Reserva, Mesa, Cliente } = require('../../models');

/* ===============================
   LISTAR RESERVAS DEL CLIENTE
================================ */
exports.index = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuarioId;

    const cliente = await Cliente.findOne({
      where: { usuarioId }
    });

    if (!cliente) {
      return res.render('error', {
        mensaje: 'Cliente no encontrado'
      });
    }

    const reservas = await Reserva.findAll({
      where: { clienteId: cliente.id },
      include: [{ model: Mesa, as: 'mesa', required: false }],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });

    res.render('clientes/reservas/index', {
      titulo: 'Mis Reservas',
      reservas
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

/* ===============================
   FORMULARIO CREAR RESERVA
================================ */
exports.mostrarCrear = async (req, res, next) => {
  try {
    const mesas = await Mesa.findAll({
      where: { activa: true }
    });

    // 👇 AQUÍ ESTABA EL ERROR
    res.render('clientes/reservas/crear', {
      titulo: 'Crear Reserva',
      mesas
    });

  } catch (error) {
    next(error);
  }
};

/* ===============================
   GUARDAR RESERVA
================================ */
exports.crear = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuarioId;

    const cliente = await Cliente.findOne({
    where: { usuarioId }
    });

    if (!cliente) {
    return res.render('error', { mensaje: 'Cliente no encontrado' });
    }


    await Reserva.create({
      clienteId: cliente.id,
      usuarioId,
      fecha: req.body.fecha,
      hora: req.body.hora,
      numeroPersonas: req.body.numeroPersonas,
      mesaId: req.body.mesaId || null,
      estado: 'pendiente'
    });

    
    res.redirect('/reservas-cliente');

  } catch (error) {
    console.error(error);
    next(error);
  }
};
