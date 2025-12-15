# SaborGourmet - Sistema de Gestión de Reservas

Sistema completo de gestión de reservas para restaurantes desarrollado con Node.js, Express, Sequelize, MySQL y Tailwind CSS.

## 🚀 Características

### Módulo 1: Revisión General del Sistema
- ✅ Sistema completo funcional para gestión de reservas
- ✅ Interfaz clara, navegación intuitiva y responsive
- ✅ Navegación fluida entre módulos
- ✅ Mensajes claros de error y confirmación

### Módulo 2: Gestión de Usuarios y Roles
- ✅ Sistema de inicio de sesión
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Roles: Admin, Mesero, Cliente
- ✅ Restricción de accesos según rol

### Módulo 3: Gestión de Mesas
- ✅ Creación de mesas
- ✅ Definición de capacidad (1-20 personas)
- ✅ Definición de zonas (interior, terraza, VIP, exterior)
- ✅ Activar/desactivar mesas
- ✅ Validación de capacidad

### Módulo 4: Gestión de Horarios
- ✅ Configuración de días de atención
- ✅ Configuración de horarios por día
- ✅ Intervalos de reservas configurables
- ✅ Duración estándar definida

### Módulo 5: Gestión de Reservas
- ✅ Crear reservas
- ✅ Editar reservas
- ✅ Cancelar y reagendar reservas
- ✅ Asignación de mesas
- ✅ Gestión de estados (pendiente, confirmada, en curso, completada, cancelada, no-show)

### Módulo 6: Gestión de Clientes
- ✅ Registro de clientes
- ✅ Historial de reservas por cliente
- ✅ Control de no-shows

### Módulo 7: Panel/Dashboard
- ✅ Visualización de reservas del día
- ✅ Estado de mesas (disponibles/ocupadas)
- ✅ Indicadores básicos (reservas, clientes, estadísticas)

### Módulo 8: Reglas de Negocio y Validaciones
- ✅ Validación de fechas (no permite fechas pasadas)
- ✅ Validación de horarios de atención
- ✅ Control de capacidad de mesas
- ✅ Políticas de cancelación

### Módulo 9: Seguridad
- ✅ Acceso solo a usuarios autenticados
- ✅ Protección de rutas según roles
- ✅ Manejo de errores

## 📋 Requisitos Previos

- Node.js 18+ 
- MySQL 5.7+ o MariaDB 10.3+
- pnpm (recomendado) o npm

## 🔧 Instalación

1. **Clonar o descomprimir el proyecto**

2. **Instalar dependencias**
```bash
pnpm install
# o
npm install
```

3. **Configurar variables de entorno**

Copiar el archivo `.env.example` a `.env` y configurar:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saborgourmet
DB_USER=root
DB_PASSWORD=tu_password

# Configuración de sesiones
SESSION_SECRET=tu_clave_secreta_aqui
```

4. **Crear la base de datos**

```sql
CREATE DATABASE saborgourmet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Importar la estructura de la base de datos**

```bash
pnpm run db:importar
```

Este comando creará todas las tablas necesarias.

6. **Poblar la base de datos con datos de prueba (opcional)**

```bash
pnpm run seed
```

Este comando creará:
- 3 usuarios (admin, mesero, cliente)
- 10 mesas
- 14 horarios
- 5 clientes
- 4 reservas de ejemplo

7. **Compilar CSS**

```bash
pnpm run css:build
```

8. **Iniciar el servidor**

```bash
# Modo desarrollo (con nodemon)
pnpm run dev

# Modo producción
pnpm start
```

El servidor estará disponible en `http://localhost:3000`

## 👥 Credenciales de Acceso (después del seed)

### Administrador
- Email: `admin@saborgourmet.com`
- Password: `admin123`
- Permisos: Acceso completo al sistema

### Mesero
- Email: `mesero@saborgourmet.com`
- Password: `mesero123`
- Permisos: Gestión de reservas, mesas y clientes

### Cliente
- Email: `cliente@saborgourmet.com`
- Password: `cliente123`
- Permisos: Ver reservas propias

## 📁 Estructura del Proyecto

```
saborgourmet/
├── config/              # Configuración de base de datos
├── controllers/         # Controladores (lógica de negocio)
├── middleware/          # Middleware (autenticación, validación)
├── models/              # Modelos de Sequelize
├── public/              # Archivos estáticos (CSS, JS)
├── routes/              # Rutas de Express
├── scripts/             # Scripts de base de datos
├── views/               # Vistas Pug
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables de entorno
├── package.json         # Dependencias del proyecto
├── server.js            # Archivo principal del servidor
└── tailwind.config.js   # Configuración de Tailwind CSS
```

## 🎯 Scripts Disponibles

```bash
# Iniciar en modo desarrollo
pnpm run dev

# Iniciar en modo producción
pnpm start

# Compilar CSS
pnpm run css:build

# Importar estructura de base de datos
pnpm run db:importar

# Poblar base de datos con datos de prueba
pnpm run seed
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo al sistema
- Gestión de usuarios
- Gestión de mesas
- Gestión de horarios
- Gestión de reservas
- Gestión de clientes
- Visualización del dashboard

### Mesero
- Gestión de reservas
- Gestión de mesas
- Gestión de clientes
- Visualización del dashboard

### Cliente
- Ver sus propias reservas
- Visualización limitada del dashboard

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, Express 5
- **Base de Datos**: MySQL, Sequelize ORM
- **Autenticación**: Express Session, bcrypt
- **Vistas**: Pug (Jade)
- **Estilos**: Tailwind CSS
- **Email**: Nodemailer (opcional)

## 📝 Notas Importantes

1. **Seguridad**: Cambiar el `SESSION_SECRET` en producción
2. **Base de datos**: Asegurarse de que MySQL esté corriendo antes de iniciar
3. **Horarios**: Configurar los horarios de atención según las necesidades del restaurante
4. **Mesas**: Crear las mesas según la distribución física del restaurante

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verificar que MySQL esté corriendo
- Verificar las credenciales en `.env`
- Verificar que la base de datos exista

### Error al compilar CSS
- Ejecutar `pnpm run css:build` manualmente
- Verificar que Tailwind CSS esté instalado

### Error de bcrypt
- Ejecutar `pnpm approve-builds bcrypt`
- Reinstalar dependencias: `pnpm install`

## 📄 Licencia

ISC

## 👨‍💻 Autor

Proyecto desarrollado para el SENA - Regional Risaralda
