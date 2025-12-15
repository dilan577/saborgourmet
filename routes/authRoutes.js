const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { noAutenticado, estaAutenticado } = require('../middleware/auth');

// ===============================
// RUTAS DE AUTENTICACIÓN
// ===============================

// Login
router.get('/login', noAutenticado, authController.mostrarLogin);
router.post('/login', authController.procesarLogin);

// Registro
router.get('/registro', noAutenticado, authController.mostrarRegistro);
router.post('/registro', authController.procesarRegistro);

// Logout (protegido)
router.get('/logout', estaAutenticado, authController.cerrarSesion);

module.exports = router;
