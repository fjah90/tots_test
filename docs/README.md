# 📚 SpaceBook API - spacebook-jfah

## 📋 Descripción General

**Autor:** Fernando Aponte

API REST para sistema de reserva de espacios para eventos. Permite a los usuarios explorar espacios disponibles (salas de reuniones, auditorios, etc.), hacer reservas y gestionarlas.

### Características de la API
- ✅ Autenticación con Laravel Sanctum
- ✅ CRUD de Espacios (Admin)
- ✅ CRUD de Reservas (Usuario)
- ✅ CRUD Admin de Reservas
- ✅ Paginación con `page` y `per_page`
- ✅ Filtros de capacidad y estado
- ✅ Validación de disponibilidad
- ✅ Soporte para múltiples imágenes

---

## 🏗️ Arquitectura del Backend

```
backend/
├── app/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Space.php
│   │   └── Reservation.php
│   └── Http/Controllers/Api/
│       ├── AuthController.php
│       ├── SpaceController.php
│       ├── ReservationController.php
│       └── AdminReservationController.php
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/api.php
```

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| Laravel | 12.x |
| PHP | >= 8.2 |
| Laravel Sanctum | Auth API |
| SQLite | Base de datos |

---

## 🗄️ Modelo de Datos

### Users (Usuarios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | string | Nombre del usuario |
| email | string | Email único |
| password | string | Contraseña hasheada |
| role | enum | 'admin' o 'user' |
| email_verified_at | timestamp | Fecha de verificación |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |
| deleted_at | timestamp | Soft delete |

### Spaces (Espacios)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| name | string | Nombre del espacio |
| description | text | Descripción detallada |
| capacity | unsigned int | Capacidad máxima |
| location | string | Ubicación física |
| amenities | json | Lista de amenidades |
| images | json | Array de URLs de imágenes |
| is_active | boolean | Estado activo/inactivo |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |
| deleted_at | timestamp | Soft delete |

### Reservations (Reservas)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | bigint | Identificador único |
| user_id | bigint | FK → users.id |
| space_id | bigint | FK → spaces.id |
| event_name | string | Nombre del evento |
| start_time | datetime | Inicio de reserva |
| end_time | datetime | Fin de reserva |
| status | enum | 'pending', 'confirmed' o 'cancelled' |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |
| deleted_at | timestamp | Soft delete |

**Índice Compuesto:** `(space_id, start_time, end_time)` para optimizar consultas de disponibilidad.

---

## 🔐 Datos de Prueba (Seeders)

### Usuarios

| Rol | Email | Password |
|-----|-------|----------|
| **Admin** | admin@espacios.com | password123 |
| **User** | juan@ejemplo.com | password123 |

### Espacios

| ID | Nombre | Capacidad | Ubicación |
|----|--------|-----------|-----------|
| 1 | Sala de Conferencias Principal | 30 | Edificio A - Piso 3 |
| 2 | Sala de Reuniones Ejecutiva | 10 | Edificio A - Piso 5 |
| 3 | Auditorio Central | 150 | Edificio B - Planta Baja |
| 4 | Espacio de Coworking Creativo | 40 | Edificio C - Piso 2 |
| 5 | Sala de Capacitación Tech | 20 | Edificio C - Piso 4 |

---

## 🚀 API Endpoints

### Autenticación
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Registro de usuarios | No |
| POST | `/api/login` | Inicio de sesión | No |
| POST | `/api/logout` | Cerrar sesión | Sí |
| GET | `/api/user` | Obtener usuario actual | Sí |

### Espacios
| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/api/spaces` | Listar espacios | No | - |
| GET | `/api/spaces?page=1&per_page=12` | Listar con paginación | No | - |
| GET | `/api/spaces?capacity_min=20&capacity_max=50` | Filtrar por capacidad | No | - |
| GET | `/api/spaces/{id}` | Detalle de espacio | No | - |
| GET | `/api/spaces/{id}/availability` | Verificar disponibilidad | No | - |
| POST | `/api/spaces` | Crear espacio | Sí | Admin |
| PUT | `/api/spaces/{id}` | Actualizar espacio | Sí | Admin |
| DELETE | `/api/spaces/{id}` | Eliminar espacio | Sí | Admin |

### Reservas (Usuario)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reservations` | Mis reservas | Sí |
| GET | `/api/reservations/{id}` | Detalle de reserva | Sí |
| POST | `/api/reservations` | Crear reserva | Sí |
| PUT | `/api/reservations/{id}` | Actualizar reserva | Sí |
| DELETE | `/api/reservations/{id}` | Cancelar reserva | Sí |

### Reservas (Admin)
| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| GET | `/api/admin/reservations` | Listar todas | Sí | Admin |
| GET | `/api/admin/reservations/{id}` | Detalle | Sí | Admin |
| POST | `/api/admin/reservations` | Crear para usuario | Sí | Admin |
| PUT | `/api/admin/reservations/{id}` | Actualizar | Sí | Admin |
| DELETE | `/api/admin/reservations/{id}` | Eliminar | Sí | Admin |

---

## 🛠️ Instalación

### Requisitos
- PHP >= 8.2
- Composer

### Pasos

```bash
cd backend

# Instalar dependencias
composer install

# Copiar configuración
cp .env.example .env

# Generar clave
php artisan key:generate

# Ejecutar migraciones y seeders
php artisan migrate:fresh --seed

# Iniciar servidor (puerto 8000)
php artisan serve
```

### URL Base
- **API:** http://localhost:8000/api

---

## 📝 Reglas de Negocio

1. **Superposición de reservas:** No se permite reservar un espacio en horarios que ya estén ocupados
2. **Autorización:** Los usuarios solo pueden modificar/cancelar sus propias reservas
3. **Roles:** Solo administradores pueden gestionar espacios (CRUD) y todas las reservas

### Validaciones
- Fecha de inicio debe ser anterior a fecha de fin
- No se pueden crear reservas en el pasado
- El espacio debe estar activo para poder reservarlo

---

## 📦 Colección Postman

Importar el archivo `docs/postman/Space_Reservation_API.postman_collection.json` en Postman.

**Variables incluidas:**
- `base_url`: http://localhost:8000/api
- `token`: Se auto-completa al hacer login

---

## 📄 Licencia

Este proyecto es parte de una prueba técnica para TOTS.

**Proyecto:** spacebook-jfah  
**Autor:** Fernando Aponte
