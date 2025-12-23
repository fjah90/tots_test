# 🔐 Configuración JWT con tymon/jwt-auth

Esta guía explica cómo migrar de Laravel Sanctum a JWT si se requiere autenticación stateless pura.

> **Nota**: Este proyecto actualmente usa **Laravel Sanctum** que es más simple para APIs. 
> JWT es preferible cuando necesitas tokens auto-contenidos o integración con microservicios.

## 📦 Instalación

```bash
composer require tymon/jwt-auth
```

## ⚙️ Configuración

### 1. Publicar configuración

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

### 2. Generar clave secreta

```bash
php artisan jwt:secret
```

Esto añade `JWT_SECRET` a tu `.env`.

### 3. Configurar User Model

```php
// app/Models/User.php

use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    // ... código existente ...

    /**
     * Get the identifier that will be stored in the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
            'name' => $this->name,
        ];
    }
}
```

### 4. Configurar Auth Guard

```php
// config/auth.php

'defaults' => [
    'guard' => 'api',
    'passwords' => 'users',
],

'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

### 5. Rutas API con JWT

```php
// routes/api.php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SpaceController;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::get('spaces', [SpaceController::class, 'index']);
Route::get('spaces/{space}', [SpaceController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Rutas Protegidas con JWT
|--------------------------------------------------------------------------
*/
Route::middleware('auth:api')->group(function () {
    
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('user', [AuthController::class, 'user']);
    });

    // Espacios (solo admin)
    Route::middleware('role:admin')->group(function () {
        Route::post('spaces', [SpaceController::class, 'store']);
        Route::put('spaces/{space}', [SpaceController::class, 'update']);
        Route::delete('spaces/{space}', [SpaceController::class, 'destroy']);
    });

    // Reservaciones
    Route::apiResource('reservations', ReservationController::class);
    Route::patch('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
});
```

### 6. AuthController para JWT

```php
// app/Http/Controllers/Api/AuthController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Registrar nuevo usuario.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Usuario registrado exitosamente',
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ], 201);
    }

    /**
     * Login con credenciales.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Cerrar sesión (invalidar token).
     */
    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente',
        ]);
    }

    /**
     * Refrescar token.
     */
    public function refresh(): JsonResponse
    {
        return $this->respondWithToken(auth('api')->refresh());
    }

    /**
     * Obtener usuario autenticado.
     */
    public function user(): JsonResponse
    {
        return response()->json(auth('api')->user());
    }

    /**
     * Responder con token y metadata.
     */
    protected function respondWithToken(string $token): JsonResponse
    {
        return response()->json([
            'user' => auth('api')->user(),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }
}
```

## 🔧 Configuración Avanzada (.env)

```env
# Tiempo de vida del token (en minutos)
JWT_TTL=60

# Tiempo de gracia para refresh (minutos)
JWT_REFRESH_TTL=20160

# Algoritmo de encriptación
JWT_ALGO=HS256

# Blacklist habilitada (para logout)
JWT_BLACKLIST_ENABLED=true
JWT_BLACKLIST_GRACE_PERIOD=0
```

## 🧪 Uso en Requests

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@espacios.com","password":"password123"}'

# Respuesta:
# {
#   "user": {...},
#   "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
#   "token_type": "bearer",
#   "expires_in": 3600
# }

# Usar token en requests
curl http://localhost:8000/api/reservations \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Refrescar token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

## ⚡ Diferencias Sanctum vs JWT

| Característica | Sanctum | JWT |
|----------------|---------|-----|
| Tokens en DB | Sí | No |
| Stateless puro | No | Sí |
| Token refresh | Manual | Automático |
| Blacklist | Por DB | Por cache |
| Ideal para | SPAs, Mobile | Microservicios |
| Complejidad | Baja | Media |

## 📚 Referencias

- [Documentación tymon/jwt-auth](https://jwt-auth.readthedocs.io/)
- [Laravel Authentication](https://laravel.com/docs/authentication)
