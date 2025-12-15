const { Usuario, Mesa, Horario, Cliente, Reserva, sequelize } = require('../models');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');
    
    // ... (código anterior)
    
    // Limpiar datos existentes
    await Reserva.destroy({ where: {}, force: true });
    await Cliente.destroy({ where: {}, force: true });
    await Mesa.destroy({ where: {}, force: true });
    await Horario.destroy({ where: {}, force: true });
    await Usuario.destroy({ where: {}, force: true });
    
    console.log('🗑️  Datos anteriores eliminados.');
    
    // Crear usuarios (CORREGIDO: Se usa create() para activar el hook de hasheo)
    const usuariosData = [
      { nombre: 'Admin', apellido: 'Sistema', email: 'admin@saborgourmet.com', password: 'admin123', telefono: '3001234567', rol: 'admin', activo: true },
      { nombre: 'Carlos', apellido: 'Mesero', email: 'mesero@saborgourmet.com', password: 'mesero123', telefono: '3009876543', rol: 'mesero', activo: true },
      { nombre: 'María', apellido: 'García', email: 'cliente@saborgourmet.com', password: 'cliente123', telefono: '3005551234', rol: 'cliente', activo: true }
    ];
    
    const usuarios = [];
    for (const userData of usuariosData) {
      const usuario = await Usuario.create(userData);
      usuarios.push(usuario);
    }
    
    console.log('👥 Usuarios creados:', usuarios.length);
    

    
    // Crear mesas
    const mesas = await Mesa.bulkCreate([
      { numero: 'M01', capacidad: 2, zona: 'interior', activa: true, descripcion: 'Mesa pequeña junto a la ventana' },
      { numero: 'M02', capacidad: 4, zona: 'interior', activa: true, descripcion: 'Mesa mediana central' },
      { numero: 'M03', capacidad: 4, zona: 'interior', activa: true, descripcion: 'Mesa mediana lateral' },
      { numero: 'M04', capacidad: 6, zona: 'interior', activa: true, descripcion: 'Mesa grande interior' },
      { numero: 'T01', capacidad: 4, zona: 'terraza', activa: true, descripcion: 'Mesa terraza con vista' },
      { numero: 'T02', capacidad: 4, zona: 'terraza', activa: true, descripcion: 'Mesa terraza esquina' },
      { numero: 'T03', capacidad: 6, zona: 'terraza', activa: true, descripcion: 'Mesa grande terraza' },
      { numero: 'V01', capacidad: 8, zona: 'vip', activa: true, descripcion: 'Mesa VIP privada' },
      { numero: 'V02', capacidad: 10, zona: 'vip', activa: true, descripcion: 'Mesa VIP grande' },
      { numero: 'E01', capacidad: 4, zona: 'exterior', activa: true, descripcion: 'Mesa exterior jardín' }
    ]);
    
    console.log('🪑 Mesas creadas:', mesas.length);
    
    // Crear horarios
    const horarios = await Horario.bulkCreate([
      { diaSemana: 'lunes', horaInicio: '12:00:00', horaFin: '15:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'lunes', horaInicio: '19:00:00', horaFin: '23:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'martes', horaInicio: '12:00:00', horaFin: '15:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'martes', horaInicio: '19:00:00', horaFin: '23:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'miercoles', horaInicio: '12:00:00', horaFin: '15:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'miercoles', horaInicio: '19:00:00', horaFin: '23:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'jueves', horaInicio: '12:00:00', horaFin: '15:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'jueves', horaInicio: '19:00:00', horaFin: '23:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'viernes', horaInicio: '12:00:00', horaFin: '15:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'viernes', horaInicio: '19:00:00', horaFin: '00:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'sabado', horaInicio: '12:00:00', horaFin: '16:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'sabado', horaInicio: '19:00:00', horaFin: '00:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'domingo', horaInicio: '12:00:00', horaFin: '16:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true },
      { diaSemana: 'domingo', horaInicio: '19:00:00', horaFin: '22:00:00', intervaloReserva: 30, duracionEstandar: 120, activo: true }
    ]);
    
    console.log('🕐 Horarios creados:', horarios.length);
    
    // Crear clientes
    const clientes = await Cliente.bulkCreate([
      { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@email.com', telefono: '3101234567', noShows: 0, bloqueado: false },
      { nombre: 'Ana', apellido: 'Martínez', email: 'ana.martinez@email.com', telefono: '3109876543', noShows: 0, bloqueado: false },
      { nombre: 'Pedro', apellido: 'López', email: 'pedro.lopez@email.com', telefono: '3205551234', noShows: 1, bloqueado: false },
      { nombre: 'Laura', apellido: 'González', email: 'laura.gonzalez@email.com', telefono: '3157778888', noShows: 0, bloqueado: false },
      { nombre: 'Diego', apellido: 'Rodríguez', email: 'diego.rodriguez@email.com', telefono: '3189991111', noShows: 0, bloqueado: false }
    ]);
    
    console.log('👤 Clientes creados:', clientes.length);
    
    // Crear reservas de ejemplo
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const reservas = await Reserva.bulkCreate([
      {
        clienteId: clientes[0].id,
        mesaId: mesas[0].id,
        fecha: hoy.toISOString().split('T')[0],
        hora: '13:00:00',
        numeroPersonas: 2,
        estado: 'confirmada',
        notas: 'Cliente prefiere mesa junto a la ventana',
        usuarioId: usuarios[1].id
      },
      {
        clienteId: clientes[1].id,
        mesaId: mesas[4].id,
        fecha: hoy.toISOString().split('T')[0],
        hora: '20:00:00',
        numeroPersonas: 4,
        estado: 'confirmada',
        notas: 'Celebración de aniversario',
        usuarioId: usuarios[1].id
      },
      {
        clienteId: clientes[2].id,
        mesaId: mesas[1].id,
        fecha: manana.toISOString().split('T')[0],
        hora: '14:00:00',
        numeroPersonas: 4,
        estado: 'pendiente',
        notas: 'Comida de negocios',
        usuarioId: usuarios[1].id
      },
      {
        clienteId: clientes[3].id,
        mesaId: mesas[7].id,
        fecha: manana.toISOString().split('T')[0],
        hora: '21:00:00',
        numeroPersonas: 8,
        estado: 'pendiente',
        notas: 'Evento familiar',
        usuarioId: usuarios[0].id
      }
    ]);
    
    console.log('📅 Reservas creadas:', reservas.length);
    
    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('Admin: admin@saborgourmet.com / admin123');
    console.log('Mesero: mesero@saborgourmet.com / mesero123');
    console.log('Cliente: cliente@saborgourmet.com / cliente123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exit(1);
  }
}

seed();
