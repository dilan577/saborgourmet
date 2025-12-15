const { Reserva, Cliente, Mesa } = require('../models');

exports.index = async (req, res, next) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);

    const reservasHoy = await Reserva.findAll({
      where: { fecha: hoy },
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Mesa, as: 'mesa' }
      ],
      order: [['hora', 'ASC']]
    });

    const reservas = await Reserva.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Mesa, as: 'mesa' }
      ],
      order: [['fecha', 'DESC'], ['hora', 'ASC']]
    });

    const totalReservasHoy = reservasHoy.length;
    const totalClientes = await Cliente.count();
    const totalMesas = await Mesa.count();

    res.render('admin/index', {
      titulo: 'Panel Administrador',
      reservas,
      reservasHoy,
      totalReservasHoy,
      totalClientes,
      totalMesas
    });

  } catch (error) {
    console.error('❌ Error Admin:', error);
    next(error);
  }
};
