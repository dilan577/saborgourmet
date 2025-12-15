const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { estaAutenticado, tieneRol } = require('../middleware/auth');

// PANEL ADMIN → index.pug
router.get(
  '/',
  estaAutenticado,
  tieneRol('admin'),
  adminController.index
);

module.exports = router;
