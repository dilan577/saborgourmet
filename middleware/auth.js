const { Usuario } = require('../models');

// ===============================
// VERIFICAR AUTENTICACIÓN + USUARIO ACTIVO
// ===============================
const estaAutenticado = async (req, res, next) => {
  if (!req.session || !req.session.usuarioId) {
    return res.redirect('/auth/login');
  }

  // 🔒 VALIDAR QUE EL USUARIO SIGA ACTIVO
  const usuario = await Usuario.findByPk(req.session.usuarioId);

  if (!usuario || !usuario.activo) {
    req.session.destroy(() => {
      return res.redirect('/auth/login');
    });
    return;
  }

  next();
};

// ===============================
// MIDDLEWARE GENÉRICO POR ROLES
// ===============================
const tieneRol = (...roles) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.usuarioId) {
      return res.redirect('/auth/login');
    }

    const usuario = await Usuario.findByPk(req.session.usuarioId);

    if (!usuario || !usuario.activo) {
      req.session.destroy(() => {
        return res.redirect('/auth/login');
      });
      return;
    }

    if (!roles.includes(usuario.rol)) {
      return res.status(403).render('error', {
        titulo: '403',
        mensaje: 'No tienes permisos para acceder a esta página'
      });
    }

    next();
  };
};

// ===============================
// ROLES ESPECÍFICOS
// ===============================
const esAdmin = tieneRol('admin');
const esAdminOMesero = tieneRol('admin', 'mesero');
const esCliente = tieneRol('cliente');

// ===============================
// VARIABLES GLOBALES PARA VISTAS
// ===============================
const agregarUsuarioAVista = (req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.usuarioId = req.session.usuarioId || null;
  res.locals.rol = req.session.rol || null;
  res.locals.estaAutenticado = Boolean(req.session.usuarioId);
  next();
};

// ===============================
// EVITAR LOGIN SI YA ESTÁ LOGUEADO
// ===============================
const noAutenticado = (req, res, next) => {
  if (req.session && req.session.usuarioId) {
    switch (req.session.rol) {
      case 'admin':
        return res.redirect('/admin');
      case 'mesero':
        return res.redirect('/admin/reservas-hoy');
      case 'cliente':
        return res.redirect('/cliente/dashboard');
      default:
        return res.redirect('/');
    }
  }
  next();
};

module.exports = {
  estaAutenticado,
  tieneRol,
  esAdmin,
  esAdminOMesero,
  esCliente,
  agregarUsuarioAVista,
  noAutenticado
};
