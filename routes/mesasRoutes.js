const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const { estaAutenticado, esAdminOMesero } = require('../middleware/auth');

// Todas las rutas requieren autenticación y rol admin o mesero
router.use(estaAutenticado);
router.use(esAdminOMesero);

// Rutas de mesas
router.get('/', mesasController.listarMesas);
router.get('/crear', mesasController.mostrarFormularioCrear);
router.post('/crear', mesasController.crearMesa);
router.get('/:id/editar', mesasController.mostrarFormularioEditar);
router.post('/:id/editar', mesasController.actualizarMesa);
router.post('/:id/toggle', mesasController.toggleEstadoMesa);
router.delete('/:id', mesasController.eliminarMesa);

module.exports = router;
