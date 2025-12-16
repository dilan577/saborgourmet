const express = require('express');
const router = express.Router();
const { Horario } = require('../models');

router.get('/disponibles', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.json([]);

    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = dias[new Date(fecha).getDay()];

    const horarios = await Horario.findAll({
      where: { diaSemana, activo: true },
      order: [['horaInicio', 'ASC']]
    });

    const horas = [];

    horarios.forEach(h => {
      let actual = h.horaInicio;

      while (actual < h.horaFin) {
        horas.push(actual.substring(0, 5));

        const [hh, mm] = actual.split(':').map(Number);
        const d = new Date(1970, 0, 1, hh, mm);
        d.setMinutes(d.getMinutes() + h.intervaloReserva);
        actual = d.toTimeString().substring(0, 5);
      }
    });

    res.json(horas);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

module.exports = router;
