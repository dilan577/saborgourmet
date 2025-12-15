const express = require('express');
const router = express.Router();

const controller = require('../controllers/cliente/clienteReservasController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

// LISTAR reservas del cliente
router.get(
  '/',
  estaAutenticado,
  tieneRol('cliente'),
  controller.index
);

// FORMULARIO CREAR reserva (CLIENTE)
router.get(
  '/crear',
  estaAutenticado,
  tieneRol('cliente'),
  controller.mostrarCrear
);

// GUARDAR reserva (CLIENTE)
router.post(
  '/crear',
  estaAutenticado,
  tieneRol('cliente'),
  controller.crear
);

module.exports = router;
