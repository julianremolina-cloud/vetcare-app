# 🐾 VetCare Frontend — Quasar Framework + Vue 3

Frontend completo, modular y profesional para el sistema de administración veterinaria **VetCare**, desarrollado con **Vue 3**, **Quasar Framework**, **Pinia**, **pinia-plugin-persistedstate**, **Vue Router** y **Axios**.

---

## 🏛️ Arquitectura del Sistema

```text
┌────────────────────────────────────────────────────────┐
│                   VETCARE FRONTEND                     │
│    Vue 3 + Quasar Framework + Pinia + Vue Router       │
│                Peticiones vía Axios                    │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP / REST (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   VETCARE BACKEND                      │
│      Node.js + Express + JWT + Mongoose ODM            │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Driver MongoDB Oficial
                            ▼
┌────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                       │
│     Base de Datos en la Nube (Cluster Seguro)          │
└────────────────────────────────────────────────────────┘
```

> ⚠️ **REGLA FUNDAMENTAL DE SEGURIDAD**:
> **El frontend NUNCA se conecta directamente a MongoDB Atlas.**
> El cliente web desconoce las credenciales, contraseñas y connection strings de la base de datos.
> La comunicación se realiza exclusivamente a través de los endpoints de la API REST del backend con autenticación JWT mediante **Axios**.

---

## 🛠️ Tecnologías y Librerías

- **Framework Principal:** [Quasar Framework](https://quasar.dev/) (v2.x) con Vue 3
- **Gestión de Estado:** [Pinia](https://pinia.vuejs.org/)
- **Persistencia de Sesión:** `pinia-plugin-persistedstate` (Almacena token JWT y perfil sin persistir contraseñas)
- **Enrutamiento:** [Vue Router](https://router.vuejs.org/) con Navigation Guards para protección de rutas y roles (RBAC)
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores de solicitud (JWT) y respuesta (manejo global de errores HTTP)
- **Herramienta de Construcción:** Vite (con `@quasar/vite-plugin`)

---

## 📂 Estructura del Proyecto

```text
frontend/
├── src/
│   ├── boot/
│   │   └── axios.js               # Instancia global de Axios e interceptores
│   ├── components/                # Componentes reutilizables
│   ├── css/
│   │   ├── app.scss               # Estilos globales de VetCare
│   │   └── quasar.variables.scss  # Paleta médica de colores Quasar
│   ├── layouts/
│   │   └── MainLayout.vue         # QLayout con Drawer lateral, Header y Menú de usuario
│   ├── pages/
│   │   ├── LoginPage.vue          # Autenticación con credenciales demo
│   │   ├── DashboardPage.vue      # Métricas, estadísticas y próximas atenciones
│   │   ├── PropietariosPage.vue   # CRUD de clientes y vista de mascotas
│   │   ├── MascotasPage.vue       # CRUD de pacientes animales y asignación
│   │   ├── HistorialMascotaPage.vue # Ficha clínica e historial cronológico
│   │   ├── VeterinariosPage.vue   # CRUD de cuerpo médico veterinario
│   │   ├── AtencionesPage.vue     # Ciclo de citas y consultas (Programada -> En curso -> Finalizada)
│   │   └── UsuariosPage.vue       # Administración de cuentas y roles (Admin)
│   ├── router/
│   │   ├── index.js               # Instancia de Router y guardias de navegación
│   │   └── routes.js              # Definición de rutas y permisos
│   ├── services/
│   │   ├── api.js                 # Re-exportador de cliente Axios
│   │   ├── authService.js         # Peticiones a /api/auth
│   │   ├── usuarioService.js      # Peticiones a /api/usuarios
│   │   ├── propietarioService.js  # Peticiones a /api/propietarios
│   │   ├── mascotaService.js      # Peticiones a /api/mascotas
│   │   ├── veterinarioService.js  # Peticiones a /api/veterinarios
│   │   ├── atencionService.js     # Peticiones a /api/atenciones
│   │   └── dashboardService.js    # Peticiones a /api/dashboard
│   ├── stores/
│   │   ├── auth.js                # Store de autenticación y permisos
│   │   ├── usuario.js             # Store de usuarios
│   │   ├── propietario.js         # Store de propietarios
│   │   ├── mascota.js             # Store de mascotas
│   │   ├── veterinario.js         # Store de veterinarios
│   │   └── atencion.js            # Store de atenciones médicas
│   ├── App.vue                    # Componente raíz
│   └── main.js                    # Montaje de Vue 3, Quasar, Pinia y Router
├── .env                           # Variables de entorno
├── .env.example                   # Plantilla de variables
├── .gitignore                     # Archivos ignorados por Git
├── index.html                     # Punto de entrada HTML
├── package.json                   # Dependencias y scripts
├── vite.config.js                 # Configuración de Vite y Quasar
└── README.md
```

---

## ⚙️ Variables de Entorno

El archivo `.env` define exclusivamente la URL del backend:

```env
# URL base de la API REST del backend de VetCare
VITE_API_URL=http://localhost:5000/api
```

Para producción, simplemente se reemplaza con la URL del servidor backend:

```env
VITE_API_URL=https://api.vetcare.com/api
```

> **IMPORTANTE:** NUNCA agregar variables como `VITE_MONGODB_URI` o credenciales de base de datos en este archivo.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js instalado (v18 o superior).
- El backend de VetCare ejecutándose en el puerto 5000 (`http://localhost:5000`).

### 1. Instalar Dependencias
```bash
cd frontend
npm install
```

### 2. Iniciar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:9000` (o el puerto asignado por Vite).

### 3. Compilar para Producción
```bash
npm run build
```
Generará el bundle optimizado en la carpeta `dist/`.

---

## 👥 Cuentas de Acceso de Prueba

En la pantalla de Login (`/login`) se incluyen botones de acceso rápido para rellenar las credenciales creadas por el seed del backend:

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@vetcare.com` | `Admin123!` | Acceso total a todos los módulos y gestión de usuarios |
| **Administrativo** | `recepcion@vetcare.com` | `Recepcion123!` | Propietarios, Mascotas, Atenciones y Dashboard |
| **Veterinario** | `dr.mendoza@vetcare.com` | `Vet123!` | Atenciones, Diagnósticos, Historiales clínicos y Mascotas |

---

## 📱 Módulos y Funcionalidades Desarrolladas

1. **Autenticación y Seguridad:**
   - Login contra el backend mediante Axios.
   - Almacenamiento seguro del token JWT en Pinia con persistencia en localStorage.
   - Guardias de navegación que impiden el acceso a rutas protegidas sin sesión activa.
   - Protección de la sección de Usuarios exclusiva para el rol `administrador`.
   - Cierre de sesión y cambio de contraseña con `QDialog`.

2. **Dashboard Operativo:**
   - Métricas en tiempo real consumidas del endpoint `/api/dashboard/resumen`.
   - Conteo de mascotas, propietarios, veterinarios y atenciones totales / de hoy.
   - Desglose por estados de atención (Programadas, En curso, Finalizadas).
   - Lista interactiva de próximas atenciones con acceso directo.

3. **Gestión de Propietarios:**
   - Tabla interactiva con `QTable` y búsqueda en tiempo real.
   - Creación y edición con validación de documento único.
   - Diálogo de visualización con lista de mascotas vinculadas al propietario.
   - Diálogo de confirmación para eliminación segura.

4. **Gestión de Mascotas:**
   - Catálogo de mascotas con especies, razas, sexo y color.
   - Selector filtrable de propietarios asociados mediante `QSelect`.
   - Filtros combinados por especie y texto.
   - Enlace directo a la ficha e historial clínico de cada paciente.

5. **Historial Clínico de Mascota:**
   - Vista especializada (`/mascotas/:id/historial`) con ficha del paciente.
   - Registro cronológico de todas las consultas médicas y atenciones realizadas.
   - Visualización detallada de síntomas, diagnóstico, tratamiento y observaciones.
   - Botón para programar una nueva atención preseleccionando a la mascota.

6. **Cuerpo Médico Veterinario:**
   - Directorio de veterinarios y sus especialidades.
   - Gestión administrativa de datos profesionales.

7. **Atenciones Médicas (Citas y Consultas):**
   - **Módulo unificado** sin duplicidad de modelos.
   - Programación de citas con fecha, hora, mascota, veterinario y motivo.
   - Cambio de estado en vivo (`Programada` ➔ `En curso` ➔ `Finalizada` / `Cancelada`).
   - Diálogo de finalización médica que exige el registro del diagnóstico y tratamiento.
