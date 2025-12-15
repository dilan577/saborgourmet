# 📘 Guía de Instalación - SaborGourmet

Esta guía te ayudará a instalar y configurar el sistema paso a paso.

## 📋 Requisitos del Sistema

### Software Necesario

1. **Node.js** (versión 18 o superior)
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: `node --version`

2. **MySQL** (versión 5.7 o superior) o **MariaDB** (versión 10.3 o superior)
   - MySQL: https://dev.mysql.com/downloads/
   - MariaDB: https://mariadb.org/download/
   - XAMPP (incluye MySQL): https://www.apachefriends.org/
   - Verificar instalación: `mysql --version`

3. **pnpm** (recomendado) o **npm**
   - Instalar pnpm: `npm install -g pnpm`
   - npm viene incluido con Node.js

## 🚀 Pasos de Instalación

### Paso 1: Preparar el Proyecto

1. Descomprimir el archivo ZIP del proyecto en una carpeta de tu elección
2. Abrir una terminal o símbolo del sistema
3. Navegar a la carpeta del proyecto:
   ```bash
   cd ruta/a/saborgourmet
   ```

### Paso 2: Instalar Dependencias

Ejecutar uno de los siguientes comandos según tu gestor de paquetes:

```bash
# Con pnpm (recomendado)
pnpm install

# Con npm
npm install
```

Si aparece un mensaje sobre bcrypt, ejecutar:
```bash
pnpm approve-builds bcrypt
# Seleccionar bcrypt con espacio y confirmar con 'y'
```

### Paso 3: Configurar MySQL

#### Opción A: Usando XAMPP

1. Iniciar XAMPP Control Panel
2. Iniciar el servicio MySQL (Apache)
3. Abrir phpMyAdmin (http://localhost/phpmyadmin)
4. Crear nueva base de datos:
   - Nombre: `saborgourmet`
   - Cotejamiento: `utf8mb4_unicode_ci`
5. Importar el archivo `database.sql`:
   - Clic en "Importar"
   - Seleccionar archivo `database.sql`
   - Clic en "Continuar"

#### Opción B: Usando MySQL desde terminal

1. Iniciar el servicio MySQL
2. Abrir terminal y ejecutar:
   ```bash
   mysql -u root -p
   ```
3. Crear la base de datos:
   ```sql
   CREATE DATABASE saborgourmet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   exit;
   ```
4. Importar el archivo SQL:
   ```bash
   mysql -u root -p saborgourmet < database.sql
   ```

### Paso 4: Configurar Variables de Entorno

1. Copiar el archivo `.env.example` y renombrarlo a `.env`
2. Abrir `.env` con un editor de texto
3. Configurar las variables según tu instalación:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=saborgourmet
DB_USER=root
DB_PASSWORD=tu_password_mysql

# Configuración de sesiones
SESSION_SECRET=cambia_esto_por_algo_seguro_123456
```

**Importante**: 
- Si usas XAMPP, normalmente `DB_PASSWORD` está vacío
- Cambia `SESSION_SECRET` por una cadena aleatoria y segura

### Paso 5: Poblar la Base de Datos (Opcional)

Para crear usuarios, mesas, horarios y datos de prueba:

```bash
# Con pnpm
pnpm run seed

# Con npm
npm run seed
```

Esto creará:
- 3 usuarios (admin, mesero, cliente)
- 10 mesas
- 14 horarios
- 5 clientes
- 4 reservas de ejemplo

### Paso 6: Compilar CSS

```bash
# Con pnpm
pnpm run css:build

# Con npm
npm run css:build
```

### Paso 7: Iniciar el Servidor

```bash
# Modo desarrollo (reinicia automáticamente con cambios)
pnpm run dev
# o
npm run dev

# Modo producción
pnpm start
# o
npm start
```

Si todo está correcto, verás:
```
✅ Conexión a la base de datos establecida correctamente.
✅ Modelos sincronizados con la base de datos.
🚀 Servidor corriendo en http://localhost:3000
```

### Paso 8: Acceder al Sistema

1. Abrir navegador web
2. Ir a: http://localhost:3000
3. Iniciar sesión con una de las cuentas:

**Administrador:**
- Email: `admin@saborgourmet.com`
- Password: `admin123`

**Mesero:**
- Email: `mesero@saborgourmet.com`
- Password: `mesero123`

**Cliente:**
- Email: `cliente@saborgourmet.com`
- Password: `cliente123`

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"

**Problema**: El servidor no puede conectarse a MySQL

**Soluciones**:
1. Verificar que MySQL esté corriendo
   - En XAMPP: Verificar que el módulo MySQL esté verde
   - En Windows Services: Verificar servicio MySQL
2. Verificar credenciales en `.env`
3. Verificar que la base de datos `saborgourmet` exista
4. Verificar el puerto (por defecto 3306)

### Error: "Port 3000 already in use"

**Problema**: El puerto 3000 ya está siendo usado

**Solución**:
1. Cambiar el puerto en `.env`:
   ```env
   PORT=3001
   ```
2. O detener el proceso que usa el puerto 3000

### Error: "bcrypt not found" o "bcrypt build error"

**Problema**: bcrypt no se compiló correctamente

**Solución**:
```bash
# Aprobar builds
pnpm approve-builds bcrypt

# O reinstalar
rm -rf node_modules
pnpm install
```

### Error: "CSS not loading" o estilos no se ven

**Problema**: El CSS no se compiló

**Solución**:
```bash
pnpm run css:build
```

### Error: "Session secret not set"

**Problema**: No se configuró SESSION_SECRET

**Solución**:
1. Abrir `.env`
2. Cambiar `SESSION_SECRET` por una cadena aleatoria

## 📱 Verificar Instalación

Para verificar que todo funciona correctamente:

1. ✅ Puedes acceder a http://localhost:3000
2. ✅ Puedes iniciar sesión
3. ✅ El dashboard muestra información
4. ✅ Puedes navegar entre módulos
5. ✅ Los estilos se ven correctamente

## 🎯 Siguientes Pasos

Después de la instalación:

1. **Cambiar contraseñas** de los usuarios de prueba
2. **Configurar horarios** según tu restaurante
3. **Crear mesas** según tu distribución
4. **Personalizar** el sistema según tus necesidades

## 📞 Soporte

Si tienes problemas durante la instalación:

1. Revisar esta guía completa
2. Verificar los requisitos del sistema
3. Consultar el archivo `README.md`
4. Revisar los logs de error en la terminal

## 🔐 Seguridad en Producción

Si vas a usar el sistema en producción:

1. Cambiar `NODE_ENV` a `production` en `.env`
2. Usar una contraseña fuerte para MySQL
3. Cambiar `SESSION_SECRET` por algo único y seguro
4. Cambiar todas las contraseñas de usuario
5. Configurar HTTPS
6. Configurar firewall y restricciones de acceso

## 📦 Estructura de Archivos Importantes

```
saborgourmet/
├── .env                    # ⚙️ Configuración (CREAR ESTE ARCHIVO)
├── .env.example            # 📄 Ejemplo de configuración
├── database.sql            # 🗄️ Script SQL para crear BD
├── README.md               # 📖 Documentación general
├── INSTALACION.md          # 📘 Esta guía
├── package.json            # 📦 Dependencias
└── server.js               # 🚀 Servidor principal
```

## ✅ Checklist de Instalación

- [ ] Node.js instalado
- [ ] MySQL instalado y corriendo
- [ ] Dependencias instaladas (`pnpm install`)
- [ ] Base de datos creada
- [ ] Archivo SQL importado
- [ ] Archivo `.env` configurado
- [ ] Seed ejecutado (opcional)
- [ ] CSS compilado
- [ ] Servidor iniciado
- [ ] Acceso al sistema verificado

¡Felicidades! Si completaste todos los pasos, el sistema está listo para usar. 🎉
