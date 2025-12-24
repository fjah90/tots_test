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
- `GET /spaces` - Listar espacios
- `GET /spaces/{id}` - Detalle de espacio
- `GET /calendar/reservations` - Reservaciones para calendario

### Autenticados
- `POST /auth/logout` - Logout
- `GET /auth/user` - Usuario actual
- `GET /reservations` - Mis reservaciones
- `POST /reservations` - Crear reservación
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
