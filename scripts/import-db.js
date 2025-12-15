const { sequelize } = require('../models');
require('dotenv').config();

async function importarBaseDatos() {
  try {
    console.log('🔄 Iniciando importación de base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos con la base de datos
    // force: true eliminará las tablas existentes y las recreará
    // alter: true modificará las tablas existentes para que coincidan con los modelos
    await sequelize.sync({ force: true });
    
    console.log('✅ Tablas creadas correctamente.');
    console.log('📊 Base de datos importada exitosamente.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al importar la base de datos:', error);
    process.exit(1);
  }
}

importarBaseDatos();
