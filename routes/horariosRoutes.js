const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');
const { estaAutenticado, esAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol admin
router.use(estaAutenticado);
router.use(esAdmin);

// Rutas de horarios
router.get('/', horariosController.listarHorarios);
router.get('/crear', horariosController.mostrarFormularioCrear);
router.post('/crear', horariosController.crearHorario);
router.get('/:id/editar', horariosController.mostrarFormularioEditar);
router.post('/:id/editar', horariosController.actualizarHorario);
router.post('/:id/toggle', horariosController.toggleEstadoHorario);
router.delete('/:id', horariosController.eliminarHorario);

module.exports = router;
