const { Usuario } = require('../models');

/*
==================================
LISTAR USUARIOS (ADMIN)
==================================
*/
exports.index = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.render('usuarios/index', {
      titulo: 'Usuarios',
      usuarios
    });
  } catch (error) {
    console.error('Error listar usuarios:', error);
    next(error);
  }
};

/*
==================================
FORMULARIO CREAR
==================================
*/
exports.mostrarCrear = (req, res) => {
  res.render('usuarios/crear', {
    titulo: 'Crear Usuario'
  });
};

/*
==================================
CREAR USUARIO
==================================
*/
exports.crear = async (req, res, next) => {
  try {
    await Usuario.create(req.body);
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }
};

/*
==================================
FORMULARIO EDITAR
==================================
*/
exports.mostrarEditar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.redirect('/usuarios');

    res.render('usuarios/editar', {
      titulo: 'Editar Usuario',
      usuario
    });
  } catch (error) {
    next(error);
  }
};

/*
==================================
ACTUALIZAR
==================================
*/
exports.actualizar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.redirect('/usuarios');

    await usuario.update(req.body);
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }
};
