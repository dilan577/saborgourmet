const express = require('express');
const router = express.Router();

const reservasController = require('../controllers/reservasController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

// 🧪 DEBUG (BORRAR DESPUÉS SI QUIERES)
console.log('listarReservas:', typeof reservasController.listarReservas);

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
// CREAR RESERVA
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
// ===============================
router.get(
  '/:id',
  estaAutenticado,
  tieneRol('admin', 'mesero'),
  reservasController.verReserva
);

module.exports = router;
