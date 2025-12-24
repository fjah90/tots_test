# Backend - SpaceBook API

API REST para sistema de reserva de espacios desarrollada con Laravel 12.

## Instalación

```bash
# Instalar dependencias
composer install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Base de datos (SQLite)
php artisan migrate:fresh --seed

# Generar documentación Swagger
php artisan l5-swagger:generate

# Iniciar servidor
php artisan serve
```

La API estará disponible en `http://localhost:8000/api`

## Tecnologías

- **Laravel 12.44.0** - Framework PHP
- **PHP 8.2+** - Lenguaje
- **SQLite** - Base de datos
- **Sanctum** - Autenticación API
- **OpenAPI/Swagger** - Documentación

## Estructura

```
app/
├── Contracts/               # Interfaces (ISP)
├── Http/Controllers/Api/    # Controladores
├── Models/                  # User, Space, Reservation
├── Services/                # Implementaciones
├── Http/Requests/           # Validación
├── Providers/               # Service Providers
database/
├── migrations/              # Esquema BD
├── seeders/                 # Datos iniciales
routes/
└── api.php                  # Endpoints
```

## API Endpoints

### Públicos (sin autenticación)
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /spaces` - Listar espacios (soporta filtros de disponibilidad)
  - `?available_date=YYYY-MM-DD` - Filtrar por fecha
  - `?available_start_time=HH:mm` - Hora de inicio del rango (por defecto 08:00)
  - `?available_end_time=HH:mm` - Hora de fin del rango (por defecto 20:00)
- `GET /spaces/{id}` - Detalle de espacio
- `GET /calendar/reservations` - Reservaciones para calendario

### Autenticados
- `POST /auth/logout` - Logout
- `GET /auth/user` - Usuario actual
- `GET /reservations` - Mis reservaciones
- `POST /reservations` - Crear reservación
- `POST /reservations/bulk` - **Crear reservaciones en múltiples fechas**
- `PATCH /reservations/{id}/cancel` - Cancelar

### Admin
- `POST /spaces` - Crear espacio
- `PUT /spaces/{id}` - Actualizar espacio
- `DELETE /spaces/{id}` - Eliminar espacio
- `PUT /reservations/{id}` - Editar reservación
- `DELETE /reservations/{id}` - Eliminar reservación
- `GET /admin/stats` - Estadísticas
- `GET /users` - Lista de usuarios

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@espacios.com | password123 |
| User | juan@ejemplo.com | password123 |

## Tests

```bash
# Ejecutar todos los tests
php artisan test

# Solo Feature tests
php artisan test --testsuite=Feature

# Test específico
php artisan test --filter=ReservationControllerTest
```

Total: 71 tests (168 assertions)

## Documentación Swagger

Disponible en: `http://localhost:8000/api/documentation`

Regenerar después de cambios:
```bash
php artisan l5-swagger:generate
```

## Seeders

El seeder crea:
- 2 usuarios (1 admin, 1 user)
- 100 espacios con datos aleatorios
- 10 tipos de espacios diferentes
- Múltiples imágenes por espacio
- **~150 reservaciones** con estados variados:
  - Confirmadas (~45%)
  - Pendientes (~35%)
  - Canceladas (~20%)
  - Distribuidas en pasado (-15 días) y futuro (+30 días)
- **Espacio de prueba**: "Sala de Juntas Elite 1" completamente ocupado el 2025-12-29 (6 bloques de 2 horas)

### Ejecutar solo ReservationSeeder
```bash
php artisan db:seed --class=ReservationSeeder
```

## Funcionalidades Extra

### Reservaciones en Múltiples Fechas (Bulk)
Permite crear reservaciones para el mismo espacio en varias fechas con un solo request:

```bash
POST /api/reservations/bulk
{
  "space_id": 1,
  "dates": ["2025-01-15", "2025-01-16", "2025-01-17"],
  "start_time": "09:00",
  "end_time": "11:00",
  "notes": "Reunión semanal"
}
```

Respuesta (soporta éxito parcial):
```json
{
  "message": "Proceso de reservaciones completado",
  "data": {
    "created": [...],
    "failed": [
      {
        "date": "2025-01-16",
        "reason": "El espacio ya está reservado en ese horario"
      }
    ]
  }
}
```

### Filtro de Disponibilidad por Rango de Hora
Filtra espacios que tengan disponibilidad en un rango horario específico:

```bash
GET /api/spaces?available_date=2025-01-15&available_start_time=09:00&available_end_time=12:00
```

Esto excluye espacios que tengan reservaciones que se superpongan con el rango solicitado.
