# 🏢 API REST - Sistema de Reserva de Espacios

API RESTful desarrollada con Laravel para gestión de reservas de espacios de trabajo (salas de reuniones, oficinas, auditorios, etc.).

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Tests](#-tests)
- [Documentación Swagger](#-documentación-swagger)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Decisiones Técnicas](#-decisiones-técnicas)

## ✨ Características

### Funcionalidades Principales
- **Autenticación**: Registro, login y logout con Laravel Sanctum (tokens API)
- **Gestión de Espacios**: CRUD completo con filtros por capacidad, nombre y estado
- **Reservas**: Crear, modificar, cancelar y listar reservas con validación de disponibilidad
- **Control de Acceso**: Roles (admin/user) con permisos diferenciados

### Funcionalidad Adicional (Bonus)
- **📊 Panel de Estadísticas** (`/api/stats/dashboard`):
  - Resumen general: usuarios, espacios, reservas
  - Top 5 espacios más reservados
  - Reservas recientes
  - Distribución por estado y por mes
- **📈 Estadísticas por Espacio** (`/api/stats/space/{id}`):
  - Total de reservas y tasa de utilización
  - Horarios más populares
  - Reservas por mes

## 🔧 Requisitos

- PHP >= 8.2
- Composer
- SQLite (o MySQL/PostgreSQL)
- Extensiones PHP: pdo_sqlite, mbstring, openssl, tokenizer, xml

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd backend

# 2. Instalar dependencias
composer install

# 3. Copiar archivo de entorno
cp .env.example .env

# 4. Generar clave de aplicación
php artisan key:generate

# 5. Crear base de datos SQLite
touch database/database.sqlite

# 6. Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# 7. Generar documentación Swagger
php artisan l5-swagger:generate

# 8. Iniciar servidor de desarrollo
php artisan serve
```

La API estará disponible en `http://localhost:8000/api`

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
APP_NAME="Space Reservation API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/ruta/absoluta/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:8000
```

### Usuarios de Prueba (Seeders)

| Rol   | Email               | Contraseña   |
|-------|---------------------|--------------|
| Admin | admin@espacios.com  | password123  |
| User  | juan@ejemplo.com    | password123  |

## 📖 Uso

### Autenticación

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer {token}
```

### Ejemplo de Flujo

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","password_confirmation":"password123"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Respuesta: {"user":{...},"token":"1|abc123..."}

# 3. Listar espacios
curl http://localhost:8000/api/spaces

# 4. Crear reserva (autenticado)
curl -X POST http://localhost:8000/api/reservations \
  -H "Authorization: Bearer 1|abc123..." \
  -H "Content-Type: application/json" \
  -d '{"space_id":1,"start_time":"2025-01-15 09:00:00","end_time":"2025-01-15 11:00:00"}'
```

## 🛣️ API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint   | Descripción                | Auth |
|--------|------------|----------------------------|------|
| POST   | /register  | Registrar nuevo usuario    | No   |
| POST   | /login     | Iniciar sesión             | No   |
| POST   | /logout    | Cerrar sesión              | Sí   |
| GET    | /user      | Obtener perfil del usuario | Sí   |

### Espacios (`/api/spaces`)

| Método | Endpoint             | Descripción              | Auth  |
|--------|----------------------|--------------------------|-------|
| GET    | /                    | Listar espacios          | No    |
| GET    | /{id}                | Ver detalle de espacio   | No    |
| POST   | /                    | Crear espacio            | Admin |
| PUT    | /{id}                | Actualizar espacio       | Admin |
| DELETE | /{id}                | Eliminar espacio         | Admin |
| GET    | /{id}/availability   | Verificar disponibilidad | No    |

**Filtros disponibles (GET /spaces):**
- `?capacity=10` - Capacidad mínima
- `?search=sala` - Buscar por nombre
- `?is_active=1` - Solo activos (1) o inactivos (0)

### Reservas (`/api/reservations`)

| Método | Endpoint      | Descripción              | Auth       |
|--------|---------------|--------------------------|------------|
| GET    | /             | Listar reservas          | Sí         |
| POST   | /             | Crear reserva            | Sí         |
| GET    | /{id}         | Ver reserva              | Propietario/Admin |
| PUT    | /{id}         | Actualizar reserva       | Propietario/Admin |
| DELETE | /{id}         | Eliminar reserva         | Propietario/Admin |
| PATCH  | /{id}/cancel  | Cancelar reserva         | Propietario/Admin |

**Filtros disponibles (GET /reservations):**
- `?status=confirmed` - Filtrar por estado (pending, confirmed, cancelled)
- `?space_id=1` - Filtrar por espacio

### Estadísticas (`/api/stats`) - Funcionalidad Adicional

| Método | Endpoint      | Descripción                    | Auth  |
|--------|---------------|--------------------------------|-------|
| GET    | /dashboard    | Estadísticas generales         | Admin |
| GET    | /space/{id}   | Estadísticas de un espacio     | Admin |

## 🧪 Tests

El proyecto incluye **49 tests** con **143 assertions** cubriendo:

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests con cobertura detallada
php artisan test --coverage

# Ejecutar grupo específico
php artisan test --filter=AuthControllerTest
php artisan test --filter=SpaceControllerTest
php artisan test --filter=ReservationControllerTest
php artisan test --filter=StatsControllerTest
```

### Cobertura de Tests

| Suite                    | Tests | Descripción                                    |
|--------------------------|-------|------------------------------------------------|
| AuthControllerTest       | 10    | Registro, login, logout, validaciones          |
| SpaceControllerTest      | 14    | CRUD, filtros, disponibilidad, permisos        |
| ReservationControllerTest| 17    | CRUD, cancelación, validaciones, ownership     |
| StatsControllerTest      | 6     | Dashboard stats, space stats, permisos         |

## 📚 Documentación Swagger

La documentación interactiva de la API está disponible en:

```
http://localhost:8000/api/documentation
```

Para regenerar la documentación:
```bash
php artisan l5-swagger:generate
```

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── SpaceController.php
│   │   │   ├── ReservationController.php
│   │   │   └── StatsController.php
│   │   └── Requests/
│   │       ├── StoreSpaceRequest.php
│   │       ├── UpdateSpaceRequest.php
│   │       ├── DeleteSpaceRequest.php
│   │       ├── StoreReservationRequest.php
│   │       └── UpdateReservationRequest.php
│   └── Models/
│       ├── User.php
│       ├── Space.php
│       └── Reservation.php
├── database/
│   ├── factories/
│   │   ├── SpaceFactory.php
│   │   └── ReservationFactory.php
│   ├── migrations/
│   │   ├── 2024_12_23_000000_create_users_table.php
│   │   ├── 2024_12_23_000001_create_spaces_table.php
│   │   └── 2024_12_23_000002_create_reservations_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php
└── tests/
    └── Feature/
        ├── AuthControllerTest.php
        ├── SpaceControllerTest.php
        ├── ReservationControllerTest.php
        └── StatsControllerTest.php
```

## 🏗️ Decisiones Técnicas

### Arquitectura
- **Laravel Sanctum** para autenticación API por tokens (simple, efectivo para SPAs y mobile)
- **Form Requests** para validación y autorización desacoplada
- **Soft Deletes** en reservas para mantener histórico
- **Eloquent Relationships** con eager loading para optimizar queries

### Base de Datos
- **SQLite** para desarrollo (fácil setup, sin dependencias externas)
- **Foreign Keys** con cascada para integridad referencial
- **Índice compuesto** (space_id, start_time, end_time) para consultas de disponibilidad eficientes

### Validaciones
- Validación de **solapamiento de horarios** al crear/actualizar reservas
- **Espacio activo** requerido para nuevas reservas
- **Fechas futuras** obligatorias para reservas

### Seguridad
- **Roles**: admin (gestión completa), user (solo sus reservas)
- **Ownership check**: usuarios solo pueden ver/modificar sus propias reservas
- **Token-based auth**: tokens revocables, sin estado en servidor

### Testing
- **Feature Tests** con `RefreshDatabase` para aislamiento
- **Factories** para generación de datos de prueba
- Cobertura de casos edge: permisos, validaciones, estados

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
