# AGENTS.md - Backend

## Project Overview
API REST Laravel 12 para Sistema de Reserva de Espacios "SpaceBook".
Autenticación con Sanctum, roles admin/user, documentación OpenAPI/Swagger.

## Setup Commands
```bash
composer install                      # Instalar dependencias
cp .env.example .env                  # Copiar configuración
php artisan key:generate              # Generar clave
php artisan migrate:fresh --seed      # Migraciones + seeders
php artisan l5-swagger:generate       # Generar docs Swagger
php artisan serve                     # Servidor (localhost:8000)
```

## Testing Instructions
- Framework: PHPUnit
- Total tests: 71 (168 assertions)
- Ejecutar antes de cada commit: `php artisan test`
- Suites: Unit, Feature

```bash
php artisan test                           # Todos los tests
php artisan test --testsuite=Feature       # Solo Feature
php artisan test --filter=ReservationTest  # Test específico
```

## Technologies
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Laravel | 12.44.0 | Framework |
| PHP | 8.2+ | Lenguaje |
| SQLite | 3.x | Base de datos |
| Sanctum | 4.x | Autenticación API |
| Swagger/OpenAPI | 4.x | Documentación |

## Project Structure
```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── SpaceController.php
│   │   ├── ReservationController.php
│   │   └── StatsController.php
│   ├── Requests/              # Form Requests (validación)
│   └── Middleware/
├── Models/
│   ├── User.php
│   ├── Space.php
│   └── Reservation.php
├── Contracts/
│   └── AvailabilityServiceInterface.php  # ISP
├── Services/
│   └── AvailabilityService.php           # Implementación
├── Providers/
│   └── AppServiceProvider.php            # Bindings DI
database/
├── migrations/
├── seeders/
│   └── DatabaseSeeder.php     # 100 espacios, 2 usuarios
routes/
└── api.php                    # Rutas API
```

## API Endpoints

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/register | Registro |
| POST | /auth/login | Login |
| GET | /spaces | Listar espacios |
| GET | /spaces/{id} | Detalle espacio |
| GET | /calendar/reservations | Reservaciones públicas |

### Autenticados
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/logout | Logout |
| GET | /auth/user | Usuario actual |
| GET | /reservations | Mis reservaciones |
| POST | /reservations | Crear reservación |
| PATCH | /reservations/{id}/cancel | Cancelar |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /spaces | Crear espacio |
| PUT | /spaces/{id} | Actualizar espacio |
| DELETE | /spaces/{id} | Eliminar espacio |
| PUT | /reservations/{id} | Editar reservación |
| DELETE | /reservations/{id} | Eliminar reservación |
| GET | /admin/stats | Estadísticas |
| GET | /users | Lista usuarios |

## Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@espacios.com | password123 |
| User | juan@ejemplo.com | password123 |

## Code Conventions
- Form Requests para validación
- Services para lógica compleja
- Interfaces para servicios (ISP/SOLID)
- Inyección de dependencias via constructor
- Type hints en todo
- Responses JSON estandarizadas

## Swagger
- URL: http://localhost:8000/api/documentation
- Regenerar: `php artisan l5-swagger:generate`
