const express = require('express');
const router = express.Router();

const reservasController = require('../controllers/reservasController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

// ===============================
// LISTAR RESERVAS (ADMIN / MESERO)
// ===============================
router.get(
  '/',
  estaAutenticado,
  tieneRol('admin', 'mesero'),
  reservasController.listarReservas
);

// ===============================
// CREAR RESERVA (ADMIN / MESERO / CLIENTE)
// ===============================
router.get(
  '/crear',
  estaAutenticado,
  tieneRol('admin', 'mesero', 'cliente'),
  reservasController.mostrarFormularioCrear
);

router.post(
  '/crear',
  estaAutenticado,
  tieneRol('admin', 'mesero', 'cliente'),
  reservasController.crearReserva
);

// ===============================
// VER RESERVA
// ADMIN / MESERO: todas
// CLIENTE: solo la suya (ya validado en controller)
// ===============================
router.get(
  '/:id',
  estaAutenticado,
  tieneRol('admin', 'mesero', 'cliente'),
  reservasController.verReserva
);

module.exports = router;
