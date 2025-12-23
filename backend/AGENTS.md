# AGENTS.md

## Project overview
API REST para Sistema de Reserva de Espacios desarrollada con Laravel 12.
Permite a usuarios registrarse, autenticarse y gestionar reservas de espacios (salas, oficinas, auditorios).

## Setup commands
- Install deps: `composer install`
- Copy env: `cp .env.example .env`
- Generate key: `php artisan key:generate`
- Create database: `touch database/database.sqlite`
- Run migrations: `php artisan migrate:fresh --seed`
- Generate Swagger: `php artisan l5-swagger:generate`
- Start dev server: `php artisan serve`

## Testing instructions
- Run all tests: `php artisan test`
- Run specific suite: `php artisan test --filter=ReservationControllerTest`
- Run unit tests only: `php artisan test --testsuite=Unit`
- Run feature tests only: `php artisan test --testsuite=Feature`
- Always run tests before committing
- Add or update tests for the code you change, even if nobody asked

## Code style
- Use Form Requests for validation (never validate in controllers)
- Use Services for complex business logic (see `app/Services/AvailabilityService.php`)
- Use Dependency Injection via constructor
- Always type hint return types: `public function store(Request $request): JsonResponse`
- Use `$request->validated()` after Form Request validation

## API Response conventions
```php
// Success with data
return response()->json([
    'message' => 'Recurso creado exitosamente',
    'data' => $resource,
], 201);

// Error
return response()->json([
    'message' => 'Descripción del error',
    'error' => 'error_code',
], 4XX);
```

## HTTP Status codes
- 200: OK (GET, PUT success)
- 201: Created (POST success)
- 204: No Content (DELETE success)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (no permissions)
- 404: Not Found
- 409: Conflict (e.g., space not available)
- 422: Unprocessable Entity (validation error)

## Authentication
- Uses Laravel Sanctum for API tokens
- Protected routes use `auth:sanctum` middleware
- Admin routes use `role:admin` middleware
- Get authenticated user: `$request->user()` or `auth()->user()`

## Database
- SQLite for development
- Always use migrations for schema changes
- Use Factories for test data
- Use Seeders for initial data
- Soft deletes enabled for Reservations

## Security considerations
- Never expose passwords or tokens in responses
- Always verify ownership before modifying resources
- Never trust user_id from request body, use `auth()->id()`
- Validate all inputs through Form Requests

## Swagger/OpenAPI
- Use `@OA\` annotations in controllers
- Regenerate docs after changes: `php artisan l5-swagger:generate`
- View docs at: `http://localhost:8000/api/documentation`

## PR instructions
- Title format: `[backend] <Title>`
- Always run `php artisan test` before committing
- Always regenerate Swagger docs if API changed
- Commit message format: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
