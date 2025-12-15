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
// EDITAR RESERVA (SOLO ADMIN)
// ===============================
router.get(
  '/:id/editar',
  estaAutenticado,
  tieneRol('admin', 'mesero'),
  reservasController.mostrarFormularioEditar
);

router.post(
  '/:id/editar',
  estaAutenticado,
  tieneRol('admin', 'mesero'),
  reservasController.actualizarReserva
);

// ===============================
// VER RESERVA (ADMIN / MESERO)
// ===============================
router.get(
  '/:id',
  estaAutenticado,
  tieneRol('admin', 'mesero'),
  reservasController.verReserva
);

module.exports = router;
