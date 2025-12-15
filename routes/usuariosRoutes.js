const express = require('express');
const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const { estaAutenticado, esAdmin } = require('../middleware/auth');

// SOLO ADMIN
router.get('/', estaAutenticado, esAdmin, usuariosController.index);
router.get('/crear', estaAutenticado, esAdmin, usuariosController.mostrarCrear);
router.post('/crear', estaAutenticado, esAdmin, usuariosController.crear);
router.get('/:id/editar', estaAutenticado, esAdmin, usuariosController.mostrarEditar);
router.post('/:id/editar', estaAutenticado, esAdmin, usuariosController.actualizar);

module.exports = router;
