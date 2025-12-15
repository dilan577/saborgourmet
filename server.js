require('dotenv').config();
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');
const { agregarUsuarioAVista } = require('./middleware/auth');

// Importar rutas
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

// Configuración de Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'saborgourmet_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Middleware para agregar usuario a las vistas
app.use(agregarUsuarioAVista);

// Rutas
app.get('/', (req, res) => {
  if (req.session.usuarioId) {
    return res.redirect('/dashboard');
  }
  res.redirect('/auth/login');
});



console.log({
  auth: typeof authRoutes,
  dashboard: typeof dashboardRoutes,
  mesas: typeof mesasRoutes,
  horarios: typeof horariosRoutes,
  clientes: typeof clientesRoutes,
  reservas: typeof reservasRoutes
});




app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/mesas', mesasRoutes);
app.use('/horarios', horariosRoutes);
app.use('/clientes', clientesRoutes);
app.use('/reservas', reservasRoutes);
app.use('/admin', adminRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/reservas-cliente', clienteReservasRoutes);


// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', {
    mensaje: 'Página no encontrada',
    error: { status: 404 }
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).render('error', {
    mensaje: err.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('✅ Modelos sincronizados con la base de datos.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
module.exports = app;