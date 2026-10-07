# 🐾 VetCare Backend — Sistema de Gestión Veterinaria

Backend completo, modular y listo para producción para el sistema de administración veterinaria **VetCare**, desarrollado con **Node.js**, **Express.js**, **Mongoose** y **MongoDB / MongoDB Atlas** utilizando módulos ES modernos (`import` / `export`).

Diseñado específicamente para ofrecer una API REST robusta, segura y fácilmente consumible mediante **Axios** desde el frontend.

---

## 📋 Tabla de Contenido

- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Base de Datos (5 Entidades)](#-modelos-de-base-de-datos-5-entidades)
- [Variables de Entorno](#-variables-de-entorno)
- [Guía Paso a Paso: Conexión con MongoDB Atlas](#-guía-paso-a-paso-conexión-con-mongodb-atlas)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
- [Ejecución de Pruebas Automatizadas](#-ejecución-de-pruebas-automatizadas)
- [Poblado de Datos Iniciales (Seed)](#-poblado-de-datos-iniciales-seed)
- [Documentación de la API REST](#-documentación-de-la-api-rest)
- [Ejemplos de Consumo con Axios](#-ejemplos-de-consumo-con-axios)

---

## 🛠 Arquitectura y Tecnologías

- **Entorno de Ejecución:** Node.js (v20+ LTS)
- **Framework Web:** Express.js
- **Base de Datos:** MongoDB (Local) / MongoDB Atlas (Cloud)
- **ODM:** Mongoose
- **Módulos:** ECMAScript Modules (`"type": "module"`)
- **Seguridad:**
  - Hashing de contraseñas con `bcryptjs`
  - Autenticación sin estado mediante `jsonwebtoken` (JWT)
  - Autorización basada en roles (RBAC): `administrador`, `administrativo`, `veterinario`
  - Protección CORS configurable mediante `cors`
- **Herramientas de Desarrollo:** `nodemon`, `dotenv`
- **Testing:** Test Runner nativo de Node.js + `supertest` + `mongodb-memory-server`

---

## 📂 Estructura del Proyecto

```text
backend/
│
├── src/
│   ├── config/
│   │   └── database.js            # Conexión centralizada Mongoose (URI agnóstica)
│   │
│   ├── models/                    # Exactamente 5 modelos principales
│   │   ├── Usuario.js             # Cuentas del sistema y roles
│   │   ├── Propietario.js         # Dueños de las mascotas
│   │   ├── Mascota.js             # Animales registrados
│   │   ├── Veterinario.js         # Profesionales médicos
│   │   └── Atencion.js            # Unifica citas programadas y consultas médicas
│   │
│   ├── controllers/               # Lógica de negocio y controladores REST
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   ├── propietarioController.js
│   │   ├── mascotaController.js
│   │   ├── veterinarioController.js
│   │   ├── atencionController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/                    # Definición de rutas y endpoints
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── propietarioRoutes.js
│   │   ├── mascotaRoutes.js
│   │   ├── veterinarioRoutes.js
│   │   ├── atencionRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── middleware/                # Filtros y validaciones
│   │   ├── authMiddleware.js      # Verificación y decodificación de JWT
│   │   ├── roleMiddleware.js      # Control de acceso basado en roles
│   │   └── errorHandler.js        # Manejo centralizado de errores y 404
│   │
│   ├── seed/
│   │   └── seed.js                # Poblado de datos iniciales realistas
│   │
│   └── app.js                     # Servidor Express y montaje de rutas
│
├── tests/
│   └── api.test.js                # Pruebas integrales de endpoints y modelos
│
├── .env                           # Variables de entorno locales (ignorado en git)
├── .env.example                   # Plantilla de configuración de variables
├── .gitignore                     # Exclusión de archivos sensibles
├── package.json                   # Dependencias y scripts
└── README.md                      # Documentación técnica
```

---

## 🗄 Modelos de Base de Datos (5 Entidades)

El sistema opera estrictamente bajo las cinco entidades requeridas:

### 1. `Usuario`
Personas con credenciales para acceder al sistema.
- `nombre`: String (requerido).
- `email`: String (requerido, único, formato email).
- `password`: String (hasheado con bcryptjs, nunca devuelto en las respuestas).
- `rol`: String (enum: `administrador`, `administrativo`, `veterinario`).
- `activo`: Boolean (default: `true`).
- `timestamps`: `createdAt`, `updatedAt`.

### 2. `Propietario`
Clientes dueños de una o más mascotas.
- `nombre`: String (requerido).
- `documento`: String (requerido, único).
- `telefono`: String (requerido).
- `correo`: String.
- `direccion`: String.
- `timestamps`: `createdAt`, `updatedAt`.

### 3. `Mascota`
Animales atendidos en la clínica veterinaria.
- `nombre`: String (requerido).
- `especie`: String (requerido, ej. Canino, Felino).
- `raza`: String.
- `sexo`: String.
- `fechaNacimiento`: Date.
- `color`: String.
- `propietario`: ObjectId referenciando al modelo `Propietario` (requerido).
- `activo`: Boolean (default: `true`).
- `timestamps`: `createdAt`, `updatedAt`.

### 4. `Veterinario`
Profesionales veterinarios registrados.
- `nombre`: String (requerido).
- `documento`: String (requerido, único).
- `telefono`: String (requerido).
- `correo`: String (requerido).
- `especialidad`: String.
- `usuario`: ObjectId opcional referenciando a `Usuario`.
- `activo`: Boolean (default: `true`).
- `timestamps`: `createdAt`, `updatedAt`.

### 5. `Atencion`
**Modelo unificado** que integra las citas programadas y las consultas clínicas:
- `mascota`: ObjectId referenciando a `Mascota` (requerido).
- `veterinario`: ObjectId referenciando a `Veterinario` (requerido).
- `fecha`: Date (requerido).
- `hora`: String (requerido, ej. `"10:30"`).
- `motivoConsulta`: String (requerido).
- `sintomas`: String.
- `diagnostico`: String.
- `tratamiento`: String.
- `observaciones`: String.
- `estado`: String (enum: `Programada`, `En curso`, `Finalizada`, `Cancelada`, default: `Programada`).
- `timestamps`: `createdAt`, `updatedAt`.

---

## ⚙️ Variables de Entorno

El archivo `.env` controla los puertos y la cadena de conexión:

```env
PORT=5000

# Para MongoDB Local:
MONGODB_URI=mongodb://127.0.0.1:27017/vetcare

# Para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<USUARIO>:<CONTRASEÑA>@<CLUSTER>.mongodb.net/vetcare?retryWrites=true&w=majority

JWT_SECRET=vetcare_jwt_secret_key_2026_super_segura
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:9000
```

> **IMPORTANTE:** El cambio entre MongoDB Local y MongoDB Atlas se realiza **únicamente modificando `MONGODB_URI` en `.env`**, sin alterar una sola línea de código en la aplicación.

---

## ☁️ Guía Paso a Paso: Conexión con MongoDB Atlas

Sigue estos pasos detallados para conectar VetCare a una base de datos en la nube en MongoDB Atlas:

1. **Crear una cuenta en MongoDB Atlas**:
   - Ingresa a [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) y regístrate gratuitamente o inicia sesión.

2. **Crear un Proyecto**:
   - En la consola de Atlas, haz clic en **New Project**, asígnale el nombre `VetCare-Project` y presiona **Next** > **Create Project**.

3. **Crear un Clúster**:
   - Haz clic en **Create** (o **Build a Database**).
   - Selecciona el nivel gratuito **M0 (Free)**.
   - Elige el proveedor de nube (AWS, Google Cloud o Azure) y la región más cercana a tu ubicación geográfica.
   - Haz clic en **Create Deployment**.

4. **Crear un Database User (Usuario de Base de Datos)**:
   - En el menú lateral izquierdo, ve a **Security** > **Database Access**.
   - Haz clic en **Add New Database User**.
   - Método de autenticación: **Password**.
   - Define un **Username** (ej. `vetcare_admin`) y una **Password** segura (guárdala bien; evita caracteres especiales confusos o asegúrate de codificarlos en la URL).
   - Asigna los permisos: **Read and write to any database** (o **Atlas Admin**).
   - Haz clic en **Add User**.

5. **Configurar el Acceso de Red (Network Access)**:
   - En el menú lateral izquierdo, ve a **Security** > **Network Access**.
   - Haz clic en **Add IP Address**.

6. **Agregar la IP de conexión**:
   - Si tienes una IP fija o deseas conectar solo tu máquina actual, haz clic en **Add Current IP Address**.

7. **Uso de `0.0.0.0/0` para desarrollo**:
   - Si estás desarrollando en un entorno con IP dinámica o deseas permitir la conexión desde cualquier ubicación durante las pruebas locales, puedes hacer clic en **Allow Access From Anywhere**, lo que configurará la entrada `0.0.0.0/0`.

8. ⚠️ **ADVERTENCIA DE SEGURIDAD**:
   > **`0.0.0.0/0` permite solicitudes de conexión entrantes desde cualquier dirección IP en Internet.** Esto es útil exclusivamente para pruebas en entornos de desarrollo temporal. **NO es la configuración recomendada para entornos de producción.** Para producción, restringe siempre el acceso a la IP específica del servidor donde esté alojado el backend.

9. **Obtener la cadena de conexión (Connection String)**:
   - En el menú lateral, dirígete a **Database** (o **Clusters**).
   - En tu clúster activo, haz clic en el botón **Connect**.
   - Selecciona la opción **Drivers** (Node.js).
   - Copia la cadena de conexión provista, que tendrá un formato como:
     ```text
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
     ```

10. **Colocar la cadena en `MONGODB_URI` en tu archivo `.env`**:
    - Reemplaza `<username>` con tu usuario de Atlas.
    - Reemplaza `<password>` con tu contraseña.
    - Especifica el nombre de la base de datos `vetcare` antes de los parámetros de consulta:
      ```env
      MONGODB_URI=mongodb+srv://vetcare_admin:MiClaveSegura123@cluster0.abcde.mongodb.net/vetcare?retryWrites=true&w=majority
      ```

11. **Ejecutar el backend**:
    - Ejecuta el comando en tu terminal:
      ```bash
      npm run dev
      ```
    - Verás en consola:
      ```text
      MongoDB conectado correctamente: cluster0-shard-... / BD: vetcare
      VetCare Backend escuchando en el puerto 5000
      ```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js instalado (v18 o superior).

### Pasos:

1. **Clonar o acceder al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   - Si no existe `.env`, copia el archivo de ejemplo:
     ```bash
     cp .env.example .env
     ```
   - Configura tu `MONGODB_URI` y tu `JWT_SECRET`.

4. **Poblar la base de datos con datos de prueba (Seed):**
   ```bash
   npm run seed
   ```

5. **Iniciar el servidor en modo desarrollo:**
   ```bash
   npm run dev
   ```

6. **Iniciar el servidor en modo producción:**
   ```bash
   npm start
   ```

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye una suite de pruebas automatizadas que utiliza el test runner nativo de Node.js y un servidor MongoDB en memoria (`mongodb-memory-server`), garantizando que se pueden probar todos los flujos sin depender de una base de datos externa:

```bash
npm test
```

### Flujos validados en los tests:
- ✅ Salud de la API (`/api/health`)
- ✅ Registro e inicio de sesión seguro con JWT
- ✅ Exclusión obligatoria del campo `password` en respuestas JSON
- ✅ Protección de rutas con tokens y rechazo de peticiones no autenticadas (401)
- ✅ CRUD completo de Usuarios con permisos de Administrador
- ✅ CRUD de Propietarios y validación de documentos únicos (400)
- ✅ CRUD de Veterinarios y asignación opcional de cuenta de usuario
- ✅ Registro de Mascotas vinculadas a su Propietario mediante ObjectId
- ✅ Flujo completo de Atención:
  1. Programación de cita (`Programada`)
  2. Consulta detallada con `populate` multidimensional
  3. Transición de estado (`En curso`)
  4. Registro de síntomas y observaciones clínicas
  5. Finalización médica con diagnóstico y tratamiento (`Finalizada`)
- ✅ Historial clínico completo de mascotas cronológicamente ordenado
- ✅ Dashboard con métricas consolidadas y próximas atenciones

---

## 👥 Datos Semilla para Pruebas (Seed)

Al ejecutar `npm run seed`, se crearán las siguientes cuentas predeterminadas:

| Rol | Correo Electrónico | Contraseña | Nombre |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@vetcare.com` | `Admin123!` | Administrador General |
| **Administrativo** | `recepcion@vetcare.com` | `Recepcion123!` | Laura Recepción |
| **Veterinario** | `dr.mendoza@vetcare.com` | `Vet123!` | Dr. Carlos Mendoza |

---

## 📡 Documentación de la API REST

Todas las respuestas exitosas devuelven `{ success: true, ... }`. Las respuestas de error devuelven `{ success: false, mensaje: "...", errores?: [...] }`.

### 1. Autenticación (`/api/auth`)
- `POST /api/auth/login` — Iniciar sesión (`email`, `password`).
- `POST /api/auth/registro` — Registrar usuario inicial.
- `GET /api/auth/perfil` — Obtener datos del usuario autenticado *(Requiere Token)*.
- `PUT /api/auth/cambiar-password` — Actualizar contraseña *(Requiere Token)*.

### 2. Usuarios (`/api/usuarios`) — *(Solo Administrador)*
- `GET /api/usuarios` — Listar usuarios (Filtros: `?rol=`, `?activo=`, `?busqueda=`).
- `GET /api/usuarios/:id` — Obtener usuario por ID.
- `POST /api/usuarios` — Crear usuario.
- `PUT /api/usuarios/:id` — Actualizar usuario.
- `DELETE /api/usuarios/:id` — Eliminar usuario.

### 3. Propietarios (`/api/propietarios`)
- `GET /api/propietarios` — Listar propietarios (Filtro: `?busqueda=`).
- `GET /api/propietarios/:id` — Detalle del propietario con sus mascotas registradas.
- `POST /api/propietarios` — Registrar propietario.
- `PUT /api/propietarios/:id` — Actualizar propietario.
- `DELETE /api/propietarios/:id` — Eliminar propietario (valida mascotas asociadas).

### 4. Mascotas (`/api/mascotas`)
- `GET /api/mascotas` — Listar mascotas con datos del propietario (Filtros: `?propietario=`, `?especie=`, `?activo=`, `?busqueda=`).
- `GET /api/mascotas/:id` — Detalle de mascota con propietario.
- `GET /api/mascotas/:id/historial` — Historial clínico completo (todas sus atenciones ordenadas).
- `POST /api/mascotas` — Registrar mascota.
- `PUT /api/mascotas/:id` — Actualizar información de la mascota.
- `DELETE /api/mascotas/:id` — Eliminar o desactivar mascota.

### 5. Veterinarios (`/api/veterinarios`)
- `GET /api/veterinarios` — Listar veterinarios (Filtros: `?especialidad=`, `?activo=`, `?busqueda=`).
- `GET /api/veterinarios/:id` — Detalle de veterinario.
- `POST /api/veterinarios` — Registrar veterinario *(Solo Administrador)*.
- `PUT /api/veterinarios/:id` — Actualizar veterinario *(Solo Administrador)*.
- `DELETE /api/veterinarios/:id` — Eliminar veterinario *(Solo Administrador)*.

### 6. Atenciones (`/api/atenciones`)
- `GET /api/atenciones` — Listar atenciones (Filtros: `?estado=`, `?veterinario=`, `?mascota=`, `?fecha=`, `?desde=`, `?hasta=`).
- `GET /api/atenciones/:id` — Detalle de atención con mascota, propietario y veterinario.
- `POST /api/atenciones` — Registrar nueva atención (cita programada o consulta).
- `PUT /api/atenciones/:id` — Actualizar información clínica o general.
- `PATCH /api/atenciones/:id/estado` — Cambiar estado (`Programada`, `En curso`, `Finalizada`, `Cancelada`).
- `PATCH /api/atenciones/:id/finalizar` — Finalizar consulta clínica con diagnóstico y tratamiento.
- `DELETE /api/atenciones/:id` — Eliminar atención *(Solo Administrador)*.

### 7. Dashboard (`/api/dashboard`)
- `GET /api/dashboard/resumen` — Resumen estadístico, métricas de atenciones y citas próximas.

---

## 💻 Ejemplos de Consumo con Axios (Frontend)

Configuración recomendada para el cliente frontend con Axios:

### Configurar instancia de Axios (`api.js`):
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar automáticamente el Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vetcare_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Iniciar sesión:
```javascript
import api from './api';

const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('vetcare_token', data.token);
    return data.usuario;
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data?.mensaje);
    throw error;
  }
};
```

### Crear una atención programada (Cita):
```javascript
const programarCita = async (mascotaId, veterinarioId, fecha, hora, motivo) => {
  const { data } = await api.post('/atenciones', {
    mascota: mascotaId,
    veterinario: veterinarioId,
    fecha,
    hora,
    motivoConsulta: motivo,
    estado: 'Programada'
  });
  return data.atencion;
};
```

### Finalizar atención médica con diagnóstico:
```javascript
const finalizarConsultaMedica = async (atencionId, datosClinicos) => {
  const { data } = await api.patch(`/atenciones/${atencionId}/finalizar`, {
    sintomas: datosClinicos.sintomas,
    diagnostico: datosClinicos.diagnostico,
    tratamiento: datosClinicos.tratamiento,
    observaciones: datosClinicos.observaciones
  });
  return data.atencion;
};
```

### Obtener el historial clínico de una mascota:
```javascript
const obtenerHistorialClinico = async (mascotaId) => {
  const { data } = await api.get(`/mascotas/${mascotaId}/historial`);
  return data; // Contiene la mascota y el arreglo de todas sus atenciones
};
```
