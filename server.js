require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');

const path = require('path');

const { sequelize } = require('./models');
const { agregarUsuarioAVista } = require('./middleware/auth');

// ===============================
// IMPORTAR RUTAS
// ===============================
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const reservasRoutes = require('./routes/reservasRoutes');
const horariosRoutes = require('./routes/horariosRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mesasRoutes = require('./routes/mesasRoutes');
const clientesRoutes = require('./routes/clientesRoutes');
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
// MIDDLEWARES BASE
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Archivos estáticos
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
    secure: false // ⚠️ mantener false en local
  }
}));

// Usuario disponible en vistas
app.use(agregarUsuarioAVista);

// ===============================
// RUTAS (ORDEN CRÍTICO)
// ===============================

// ✅ INDEX PÚBLICO
app.use('/', indexRoutes);

// Autenticación
app.use('/auth', authRoutes);

// Dashboards (PROTEGIDOS)
app.use('/dashboard', auth.estaAutenticado, dashboardRoutes);
app.use('/cliente', auth.estaAutenticado, clienteDashboardRoutes);

// Módulos
app.use('/reservas', reservasRoutes);
app.use('/horarios', auth.estaAutenticado, horariosRoutes);
app.use('/mesas', auth.estaAutenticado, mesasRoutes);
app.use('/clientes', auth.estaAutenticado, clientesRoutes);

// Admin
app.use('/admin', auth.estaAutenticado, auth.tieneRol('admin'), adminRoutes);
app.use('/usuarios', auth.estaAutenticado, auth.tieneRol('admin'), usuariosRoutes);
app.use('/reservas-cliente', auth.estaAutenticado, clienteReservasRoutes);


// ===============================
// 404 (SOLO SI NO ENTRA A NADA)
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
  res.status(500).render('error', {
    titulo: 'Error',
    mensaje: err.message || 'Error interno del servidor'
  });
});

// ===============================
// INICIAR SERVIDOR
// ===============================
const iniciarServidor = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;
