# SpaceBook - Sistema de Reserva de Espacios

> **Prueba Técnica Full Stack Developer** - TOTS TEST | Diciembre 2025

Sistema completo de reserva de espacios y salas con gestión administrativa, autenticación y reservaciones en tiempo real.

## 📋 Tabla de Contenidos

- [Características Implementadas](#-características-implementadas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Instalación y Setup](#-instalación-y-setup)
- [Credenciales de Acceso](#-credenciales-de-acceso)
- [Features Adicionales](#-features-adicionales)
- [Checklist de Requisitos](#-checklist-de-requisitos)

---

## 🎯 Características Implementadas

### Backend (Laravel 12)
- ✅ **Autenticación con Sanctum**: API tokens seguros para cliente-servidor
- ✅ **Gestión de Espacios**: CRUD completo con filtros y búsqueda
- ✅ **Sistema de Reservaciones**: Crear, listar, actualizar y cancelar reservas
- ✅ **CRUD Admin de Reservaciones**: Crear, editar y eliminar reservas como admin
- ✅ **Dashboard Administrativo**: Estadísticas en tiempo real
- ✅ **Seed de Datos**: 100 espacios con datos aleatorios y realistas
- ✅ **Imágenes Múltiples**: Soporte para múltiples imágenes por espacio (array)
- ✅ **OpenAPI/Swagger**: Documentación automática de API

### Frontend (Angular 21)
- ✅ **Interfaz Responsiva**: Grid 3 columnas (desktop), 2 (tablet), 1 (móvil)
- ✅ **Dark Mode Completo**: Toggle persistente con soporte en TODOS los componentes
- ✅ **Carousel de Imágenes**: Navegación fluida con controles ocultos en hover
- ✅ **Filtros Dinámicos**: Búsqueda, fecha, capacidad con actualización en tiempo real
- ✅ **Tarjetas Uniformes**: Altura consistente sin scroll horizontal
- ✅ **Modal de Reserva**: Formulario integrado con validación
- ✅ **Gestión de Reservas**: Mis reservas, cancelación, historial
- ✅ **Admin Dashboard**: Estadísticas, gestión de espacios y reservaciones
- ✅ **CRUD Múltiples Imágenes**: Agregar/eliminar imágenes en formulario de espacios
- ✅ **Menú Admin Dropdown**: Acceso rápido a Espacios, Reservaciones, Estadísticas

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Laravel** | 12.44.0 | Framework PHP para API REST |
| **PHP** | 8.2+ | Lenguaje de backend |
| **SQLite** | 3.x | Base de datos (Laragon) |
| **Sanctum** | 4.x | Autenticación API |
| **Swagger/OpenAPI** | 4.x | Documentación API |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Angular** | 21.0.6 | Framework TypeScript |
| **TypeScript** | 5.6.2 | Tipado estático |
| **PrimeNG** | 21.0.2 | Componentes UI (Carousel, DatePicker, Dialog) |
| **TailwindCSS** | 3.4.19 | Estilos utilitarios |
| **SCSS** | Latest | Estilos avanzados y dark mode |
| **RxJS** | 7.x | Programación reactiva |

### Herramientas
- **Laragon**: Servidor local XAMPP
- **Node.js**: Gestor de dependencias (npm)
- **Git**: Control de versiones
- **VS Code**: IDE principal

---

## 📐 Arquitectura del Proyecto

```
tots_test/
├── backend/                          # API REST Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/     # Controladores API
│   │   │   ├── AuthController.php
│   │   │   ├── SpaceController.php
│   │   │   ├── ReservationController.php
│   │   │   └── StatsController.php
│   │   ├── Models/                   # Modelos Eloquent
│   │   │   ├── User.php
│   │   │   ├── Space.php
│   │   │   └── Reservation.php
│   │   └── Services/                 # Lógica de negocio
│   ├── database/
│   │   ├── migrations/               # Migraciones (espacios, reservaciones)
│   │   └── seeders/                  # Seeders (100 espacios + users)
│   ├── routes/
│   │   └── api.php                   # Rutas API
│   └── storage/database.sqlite       # Base de datos SQLite
│
├── frontend/                         # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── services/         # Servicios (Auth, Spaces, Reservations)
│   │   │   │   └── guards/           # Guards (autenticación)
│   │   │   ├── features/
│   │   │   │   ├── auth/             # Login/Register
│   │   │   │   ├── spaces/           # Listado y detalle de espacios
│   │   │   │   ├── reservations/     # Mis reservas
│   │   │   │   └── admin/            # Dashboard administrativo
│   │   │   ├── shared/
│   │   │   │   ├── interfaces/       # TypeScript interfaces
│   │   │   │   ├── pipes/            # Pipes personalizados
│   │   │   │   └── components/       # Componentes reutilizables
│   │   │   └── app.routes.ts         # Rutas principales
│   │   ├── styles.scss               # Estilos globales + dark mode
│   │   └── index.html                # HTML principal
│   └── angular.json                  # Configuración Angular
│
└── docs/                             # Documentación
```

### Arquitectura de Capas

```
┌─────────────────────────────────────┐
│      PRESENTACIÓN (Angular UI)       │
│  ├─ Componentes (Spaces, Reservations)
│  ├─ Servicios HTTP (SpacesService)
│  └─ Guards de ruta (AuthGuard)
├─────────────────────────────────────┤
│      LÓGICA DE NEGOCIO (Laravel)    │
│  ├─ Controladores API                │
│  ├─ Modelos Eloquent                │
│  ├─ Servicios                       │
│  └─ Validación                      │
├─────────────────────────────────────┤
│      DATOS (SQLite)                 │
│  ├─ Tabla: users                    │
│  ├─ Tabla: spaces                   │
│  └─ Tabla: reservations             │
└─────────────────────────────────────┘
```

---

## 🚀 Instalación y Setup

### Prerequisites
- **Node.js** 18+ (para Angular)
- **PHP** 8.2+
- **Composer** (gestor de dependencias PHP)
- **Laragon** (servidor local)
- **Git**

### 1. Clonar el Repositorio

```bash
cd /path/to/laragon/www
git clone <repo-url> tots_test
cd tots_test
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
composer install

# Copiar archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# El servidor estará en: http://localhost:8000
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
# o
ng serve

# La aplicación estará en: http://localhost:4200
```

### 4. Verificar Conexión

```bash
# Terminal 1: Backend
cd backend && php artisan serve

# Terminal 2: Frontend  
cd frontend && ng serve

# Browser: http://localhost:4200
```

---

## 🔐 Credenciales de Acceso

| Rol | Email | Contraseña | Propósito |
|-----|-------|-----------|----------|
| **Admin** | `admin@espacios.com` | `password123` | Dashboard administrativo |
| **Usuario** | `juan@ejemplo.com` | `password123` | Cliente regular |

**Nota**: Las contraseñas están hasheadas en la BD (bcrypt). Se regeneran con cada `migrate:fresh --seed`.

---

## ✨ Features Adicionales

Más allá de los requisitos básicos, se implementaron:

### 1. **Dark Mode Completo**
- Toggle en navbar que alterna Light ↔ Dark ↔ System
- Persistencia en localStorage (`spacebook-theme`)
- Transiciones CSS suaves
- **Soporte en TODOS los componentes** (PrimeNG, formularios, tablas, cards)
- Estilos globales en `styles.scss` para componentes PrimeNG

### 2. **Carousel de Imágenes Avanzado**
- Múltiples imágenes por espacio (array en BD)
- Navegación con botones `<` `>` ocultos (aparecen en hover)
- Indicador de cantidad de imágenes
- Altura fija sin scroll horizontal

### 3. **CRUD Completo de Reservaciones (Admin)**
- **Crear**: Modal con selección de usuario, espacio, fechas y estado
- **Editar**: Modificar cualquier reservación existente
- **Cancelar**: Cambiar estado a "cancelada"
- **Eliminar**: Borrar permanentemente de la base de datos
- Formulario con validación y mensajes de error

### 4. **Formulario de Múltiples Imágenes**
- Agregar URLs de imágenes una por una
- Preview en grid de todas las imágenes
- Botón de eliminar en cada imagen (visible en hover)
- Indicador de "imagen principal" (primera de la lista)
- Estado vacío con mensaje informativo

### 5. **Menú Admin Dropdown**
- Navegación rápida desde el header
- Submenú con: Espacios, Reservaciones, Estadísticas
- Icono de chevron indicando dropdown
- Animación suave de apertura

### 6. **Grid Responsivo Uniforme**
- Tarjetas con altura consistente
- Estructura de contenido fija (título, descripción, info, amenities)
- Sin variaciones visuales entre tarjetas

### 7. **Seeder Avanzado**
- 100 espacios con datos aleatorios
- 10 tipos diferentes de espacios
- 6 edificios, 8 pisos
- 30 amenidades variadas
- 70% de espacios con múltiples imágenes

### 8. **Validación y Manejo de Errores**
- Validación en frontend y backend
- Mensajes Toast personalizados
- Guards de ruta para proteger areas administrativas

### 9. **OpenAPI/Swagger**
- Documentación automática de endpoints
- Accesible en: `http://localhost:8000/api/documentation`

---

## 📦 Endpoints Principales

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/user
```

### Espacios
```
GET    /api/spaces                    # Listar todos (con paginación)
GET    /api/spaces/{id}              # Detalle de espacio
POST   /api/spaces                    # Crear (solo admin)
PUT    /api/spaces/{id}              # Actualizar (solo admin)
DELETE /api/spaces/{id}              # Eliminar (solo admin)
```

### Reservaciones
```
GET    /api/reservations             # Mis reservas (admin ve todas)
POST   /api/reservations             # Crear reserva (admin puede asignar user_id)
PUT    /api/reservations/{id}        # Actualizar reserva
PATCH  /api/reservations/{id}        # Actualizar estado
PATCH  /api/reservations/{id}/cancel # Cancelar reserva
DELETE /api/reservations/{id}        # Eliminar permanentemente
```

### Estadísticas (Admin)
```
GET    /api/stats                    # Estadísticas generales
GET    /api/stats/monthly            # Estadísticas mensuales
```

---

## 📊 Checklist de Requisitos

### Funcionalidades Requeridas ✅

| # | Requisito | Estado | Notas |
|---|-----------|--------|-------|
| 1 | **Autenticación Login/Register** | ✅ Completo | Sanctum + Guards |
| 2 | **Listado de Espacios** | ✅ Completo | Grid responsivo 3 cols |
| 3 | **Filtros Dinámicos** | ✅ Completo | Búsqueda, fecha, capacidad |
| 4 | **Detalle de Espacio** | ✅ Completo | Ruta `/spaces/{id}` |
| 5 | **Sistema de Reservas** | ✅ Completo | Modal + validación |
| 6 | **Mis Reservas** | ✅ Completo | Histórico y cancelación |
| 7 | **Panel Administrativo** | ✅ Completo | Stats, gestión espacios |
| 8 | **Dark Mode** | ✅ Completo | Toggle + persistencia |
| 9 | **Responsive Design** | ✅ Completo | Mobile-first TailwindCSS |
| 10 | **Base de Datos** | ✅ Completo | SQLite con migraciones |

### Features Adicionales Implementados ✨

| # | Feature | Descripción |
|----|---------|-------------|
| A1 | **Carousel de Imágenes** | Múltiples imágenes por espacio con navegación |
| A2 | **Seeder de 100 Espacios** | Datos realistas y variados |
| A3 | **Dark Mode Completo** | Soporte en TODOS los componentes y PrimeNG |
| A4 | **Uniformidad de Cards** | Altura y estructura consistente |
| A5 | **Indicador de Imágenes** | Badge mostrando cantidad de fotos |
| A6 | **Validación Completa** | Frontend + Backend |
| A7 | **Documentación OpenAPI** | Swagger automático |
| A8 | **Mejor UX en Carousels** | Controles ocultos hasta hover |
| A9 | **Gestión de Amenities** | Tags dinámicos por espacio |
| A10 | **Sistema de Capacidades** | Filtro inteligente por personas |
| A11 | **CRUD Admin Reservaciones** | Crear, editar, eliminar reservas como admin |
| A12 | **Formulario Múltiples Imágenes** | Agregar/eliminar URLs de imágenes con preview |
| A13 | **Menú Dropdown Admin** | Navegación rápida entre secciones admin |
| A14 | **Eliminar Reservación** | Eliminación permanente (no solo cancelar) |

---

## 🧪 Pruebas Funcionales

### Autenticación
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@espacios.com","password":"password123"}'

# Resultado: { "token": "...", "user": {...} }
```

### Espacios
```bash
# Listar espacios
curl -X GET http://localhost:8000/api/spaces

# Filtrar por capacidad
curl -X GET "http://localhost:8000/api/spaces?capacity_min=10&capacity_max=50"
```

### Reservaciones
```bash
# Crear reserva (requiere token)
curl -X POST http://localhost:8000/api/reservations \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"space_id":1,"start_date":"2025-12-25","end_date":"2025-12-26"}'
```

---

## 📁 Base de Datos

### Esquema

```sql
-- Usuarios
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  password VARCHAR,
  is_admin BOOLEAN,
  created_at TIMESTAMP
);

-- Espacios
CREATE TABLE spaces (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  description TEXT,
  capacity INTEGER,
  location VARCHAR,
  amenities JSON,
  image_url VARCHAR,
  images JSON,          -- Array de URLs
  is_active BOOLEAN,
  created_at TIMESTAMP
);

-- Reservaciones
CREATE TABLE reservations (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  space_id INTEGER,
  start_date DATE,
  end_date DATE,
  status VARCHAR,       -- pending, confirmed, cancelled
  created_at TIMESTAMP
);
```

---

## 🎨 Estilos y Temas

### Paleta de Colores
- **Primario**: Teal `#2dd4bf`
- **Secundario**: Teal oscuro `#14b8a6`
- **Fondo Claro**: `#f8fafc`
- **Fondo Oscuro**: `#111827`
- **Texto**: Grises escalados

### Componentes PrimeNG Personalizados
- Cards con hover effect
- DatePicker con iconos
- Carousels adaptados
- Tags de amenities
- Dividers en dark mode
- Sliders de capacidad

---

## 🔧 Troubleshooting

### Puerto 8000 en uso
```bash
php artisan serve --port=8080
# Luego cambiar URL en frontend/src/environments
```

### Node modules corrupto
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Base de datos corrupta
```bash
cd backend
php artisan migrate:fresh --seed
```

### Dark mode no persiste
- Limpiar localStorage: `localStorage.clear()`
- Verificar `ThemeService` en `core/services/theme.service.ts`

---

## 📚 Documentación Adicional

- **API Docs**: `http://localhost:8000/api/documentation`
- **Angular CLI**: `ng --version`
- **Laravel Docs**: https://laravel.com/docs/12
- **PrimeNG Components**: https://primeng.org/

---

## 👤 Autor

**Desarrollador Full Stack** - TOTS TEST Challenge  
Diciembre 2025

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **SQLite**: Elegido por simplicidad en Laragon, fácil de respaldar
2. **PrimeNG 21**: Componentes profesionales pre-estilizados
3. **TailwindCSS**: Utilidades rapidas para responsive
4. **Standalone Components**: Angular 21 sin NgModules
5. **Signals**: Reactividad moderna en Angular (signals/computed)

### Optimizaciones

- ✅ Lazy loading de rutas
- ✅ Image optimization (object-fit: cover)
- ✅ CSS minificado en producción
- ✅ Caché en localStorage para datos frecuentes
- ✅ Paginación en listados grandes
- ✅ Dark mode global en `styles.scss` para todos los componentes PrimeNG
- ✅ Transiciones suaves en cambio de tema

---

## 📄 Licencia

Proyecto de evaluación técnica - TOTS TEST

---

**Última actualización**: Diciembre 23, 2025
