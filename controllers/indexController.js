const { Reserva, Mesa, Cliente } = require('../models');

/* ===============================
   INDEX PÚBLICO
================================ */
const index = async (req, res) => {
  try {
    const mesas = await Mesa.findAll({
      where: { activa: true }
    });

    res.render('index', {
      titulo: 'Bienvenidos a SaborGourmet',
      mesas,
      ok: req.query.ok || null,
      error: req.query.error || null
    });

  } catch (error) {
    console.error('❌ Error index:', error);
    res.status(500).render('error', {
      titulo: 'Error',
      mensaje: 'Error al cargar la página principal'
    });
  }
};

/* ===============================
   RESERVA PÚBLICA
================================ */
const crearReservaPublica = async (req, res) => {
  try {
    const {
      nombre,
      telefono,
      fecha,
      hora,
      numeroPersonas,
      mesaId
    } = req.body;

    if (!nombre || !telefono || !fecha || !hora || !numeroPersonas || !mesaId) {
      throw new Error('Todos los campos son obligatorios');
    }

    const mesa = await Mesa.findByPk(mesaId);
    if (!mesa || !mesa.activa) {
      throw new Error('Mesa no válida');
    }

    if (Number(numeroPersonas) > mesa.capacidad) {
      throw new Error(`La mesa solo permite ${mesa.capacidad} personas`);
    }

    let cliente = await Cliente.findOne({
      where: { email: 'publico@saborgourmet.com' }
    });

    if (!cliente) {
      cliente = await Cliente.create({
        nombre: 'Cliente',
        apellido: 'Público',
        email: 'publico@saborgourmet.com',
        telefono
      });
    }

    await Reserva.create({
      clienteId: cliente.id,
      mesaId,
      fecha,
      hora,
      numeroPersonas,
      estado: 'pendiente'
    });

    return res.redirect('/?ok=Reserva creada correctamente');

  } catch (error) {
    return res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
};

module.exports = {
  index,
  crearReservaPublica
};
