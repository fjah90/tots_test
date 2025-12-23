# 📚 Documentación - Sistema de Reserva de Espacios

## 📋 Descripción General

API REST para un sistema de reserva de espacios para eventos. Permite a los usuarios explorar espacios disponibles (salas de reuniones, auditorios, etc.), hacer reservas y gestionarlas.

---

## 🏗️ Arquitectura del Proyecto

```
tots_test/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Space.php
│   │   │   └── Reservation.php
│   │   └── Http/Controllers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/
├── docs/                    # Documentación
│   ├── README.md
│   └── postman/
│       └── Space_Reservation_API.postman_collection.json
└── frontend/                # Angular SPA (pendiente)
```

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
| image_url | string | URL de imagen |
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
| status | enum | 'confirmed' o 'cancelled' |
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

## 🚀 API Endpoints (Planificados)

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
| GET | `/api/spaces/{id}` | Detalle de espacio | No | - |
| POST | `/api/spaces` | Crear espacio | Sí | Admin |
| PUT | `/api/spaces/{id}` | Actualizar espacio | Sí | Admin |
| DELETE | `/api/spaces/{id}` | Eliminar espacio | Sí | Admin |

### Reservas
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reservations` | Mis reservas | Sí |
| POST | `/api/reservations` | Crear reserva | Sí |
| PUT | `/api/reservations/{id}` | Actualizar reserva | Sí |
| DELETE | `/api/reservations/{id}` | Cancelar reserva | Sí |

---

## 🛠️ Instalación

### Requisitos
- PHP >= 8.2
- Composer
- MySQL/SQLite
- Node.js >= 18 (para frontend)

### Backend

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

# Iniciar servidor
php artisan serve
```

---

## 📝 Notas de Desarrollo

### Reglas de Negocio
1. **Superposición de reservas:** No se permite reservar un espacio en horarios que ya estén ocupados
2. **Autorización:** Los usuarios solo pueden modificar/cancelar sus propias reservas
3. **Roles:** Solo administradores pueden gestionar espacios (CRUD)

### Validaciones Adicionales
- Fecha de inicio debe ser anterior a fecha de fin
- No se pueden crear reservas en el pasado
- El espacio debe estar activo para poder reservarlo

---

## 📄 Licencia

Este proyecto es parte de una prueba técnica para TOTS.
