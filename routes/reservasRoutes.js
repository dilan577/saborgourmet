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

// 🔐 CAMBIAR ESTADO RESERVA (ADMIN / MESERO)
router.post(
  '/:id/confirmar',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.confirmarReserva
);

router.post(
  '/:id/cancelar',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.cancelarReserva
);

router.post(
  '/:id/en-curso',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.marcarEnCurso
);

router.post(
  '/:id/completar',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.completarReserva
);

router.post(
  '/:id/no-show',
  auth.estaAutenticado,
  auth.tieneRol('admin', 'mesero'),
  reservasController.marcarNoShow
);



module.exports = router;
