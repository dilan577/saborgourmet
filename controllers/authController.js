const { Usuario, Cliente, sequelize } = require('../models');
const bcrypt = require('bcrypt');

/* ===============================
   MOSTRAR LOGIN
================================ */
const mostrarLogin = (req, res) => {
  res.render('auth/login', {
    titulo: 'Iniciar Sesión',
    error: null
  });
};

/* ===============================
   PROCESAR LOGIN
================================ */
const procesarLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('auth/login', {
        titulo: 'Iniciar Sesión',
        error: 'Todos los campos son obligatorios'
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.activo) {
      return res.render('auth/login', {
        titulo: 'Iniciar Sesión',
        error: 'Credenciales incorrectas'
      });
    }

    const valido = await usuario.verificarPassword(password);
    if (!valido) {
      return res.render('auth/login', {
        titulo: 'Iniciar Sesión',
        error: 'Credenciales incorrectas'
      });
    }

    /* ===============================
       SESIÓN
    ================================ */
    req.session.usuarioId = usuario.id;
    req.session.rol = usuario.rol;
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol
    };

    /* ===============================
       REDIRECCIÓN POR ROL (CORRECTA)
    ================================ */
    switch (usuario.rol) {
      case 'admin':
        return res.redirect('/admin');
      case 'mesero':
        return res.redirect('/admin/reservas-hoy');
      case 'cliente':
        return res.redirect('/cliente/dashboard');
      default:
        return res.redirect('/');
    }

  } catch (error) {
    console.error('❌ Error login:', error);
    return res.render('auth/login', {
      titulo: 'Iniciar Sesión',
      error: 'Error al iniciar sesión'
    });
  }
};

/* ===============================
   MOSTRAR REGISTRO
================================ */
const mostrarRegistro = (req, res) => {
  res.render('auth/registro', {
    titulo: 'Registrarse',
    error: null
  });
};

/* ===============================
   PROCESAR REGISTRO
================================ */
const procesarRegistro = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      await t.rollback();
      return res.render('auth/registro', {
        titulo: 'Registrarse',
        error: 'Todos los campos son obligatorios'
      });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      await t.rollback();
      return res.render('auth/registro', {
        titulo: 'Registrarse',
        error: 'El email ya está registrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol: 'cliente',
      activo: true
    }, { transaction: t });

    await Cliente.create({
      usuarioId: usuario.id,
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      noShows: 0,
      bloqueado: false
    }, { transaction: t });

    await t.commit();
    return res.redirect('/auth/login');

  } catch (error) {
    await t.rollback();
    console.error('❌ Error registro:', error);
    return res.render('auth/registro', {
      titulo: 'Registrarse',
      error: 'Error al registrar usuario'
    });
  }
};

/* ===============================
   LOGOUT
================================ */
const cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};

module.exports = {
  mostrarLogin,
  procesarLogin,
  mostrarRegistro,
  procesarRegistro,
  cerrarSesion
};
