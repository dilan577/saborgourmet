const express = require('express');
const router = express.Router();
const controller = require('../controllers/cliente/clienteDashboardController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

router.get(
  '/clientes/dashboard',
  estaAutenticado,
  tieneRol('cliente'),
  controller.index
);

module.exports = router;
