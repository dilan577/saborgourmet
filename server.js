require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const { sequelize } = require('./models');
const { agregarUsuarioAVista } = require('./middleware/auth');

// ===============================
// IMPORTAR RUTAS
// ===============================
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const clienteDashboardRoutes = require('./routes/clienteDashboardRoutes');
const clienteReservasRoutes = require('./routes/clienteReservasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// CONFIGURACIÓN DE VISTAS
// ===============================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ===============================
// MIDDLEWARES
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// SESIONES
// ===============================
app.use(session({
  secret: process.env.SESSION_SECRET || 'saborgourmet_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Usuario disponible en vistas
app.use(agregarUsuarioAVista);

// ===============================
// RUTAS (ORDEN CORRECTO)
// ===============================

// 👉 INDEX PÚBLICO (PRIMERO)
app.use('/', indexRoutes);

// Autenticación
app.use('/auth', authRoutes);

// Dashboards
app.use('/dashboard', dashboardRoutes);
app.use('/cliente', clienteDashboardRoutes);

// Módulos
app.use('/mesas', mesasRoutes);
app.use('/horarios', horariosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/reservas', reservasRoutes);
app.use('/admin', adminRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/reservas-cliente', clienteReservasRoutes);

// ===============================
// 404
// ===============================
app.use((req, res) => {
  res.status(404).render('error', {
    titulo: '404',
    mensaje: 'Página no encontrada'
  });
});

// ===============================
// ERRORES GENERALES
// ===============================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).render('error', {
    titulo: 'Error',
    mensaje: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const iniciarServidor = async () => {
  try {
    if (typeof sequelize.testConnection === 'function') {
      await sequelize.testConnection();
    } else {
      await sequelize.authenticate();
      console.log('✅ Conectado a la base de datos');
    }

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar:', error.message || error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;
