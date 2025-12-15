const express = require('express');
const router = express.Router();

const reservasController = require('../controllers/reservasController');
const auth = require('../middleware/auth');

/* ======================================================
   🔓 RESERVA PÚBLICA (SIN LOGIN)
   👉 Desde el index.pug
====================================================== */
router.post(
  '/crear',
  reservasController.crearReserva
);

/* ======================================================
   🔐 LISTAR RESERVAS (ADMIN / MESERO)
====================================================== */
router.get(
  '/',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.listarReservas
);

/* ======================================================
   🔐 FORMULARIO CREAR (INTERNO)
   👉 Admin / Mesero / Cliente logueado
====================================================== */
router.get(
  '/crear',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero', 'cliente'),
  reservasController.mostrarFormularioCrear
);

/* ======================================================
   🔐 VER RESERVA
====================================================== */
router.get(
  '/:id',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero', 'cliente'),
  reservasController.verReserva
);

/* ======================================================
   🔐 CAMBIAR ESTADO (ADMIN / MESERO)
   👉 Confirmar | Atendida | No show
====================================================== */

router.post(
  '/:id/estado',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.cambiarEstado
);


module.exports = router;
