const express = require('express');
const router = express.Router();

const clientesController = require('../controllers/clientesController');
const clienteDashboardController = require('../controllers/cliente/clienteDashboardController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

console.log(typeof clienteDashboardController.index);


router.get(
  '/dashboard',
  estaAutenticado,
  tieneRol('cliente'),
  clienteDashboardController.index // ✅ ahora sí es función
);

// ===============================
// LISTAR
// ===============================
router.get(
  '/',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.listarClientes
);

// ===============================
// CREAR
// ===============================
router.get(
  '/crear',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.mostrarFormularioCrear
);

router.post(
  '/crear',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.crearCliente
);

// ===============================
// VER CLIENTE ✅
// ===============================
router.get(
  '/:id',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.verCliente
);

// ===============================
// EDITAR CLIENTE ✅
// ===============================
router.get(
  '/:id/editar',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.mostrarFormularioEditar
);

router.post(
  '/:id/editar',
  estaAutenticado,
  tieneRol('admin'),
  clientesController.actualizarCliente
);




module.exports = router;
