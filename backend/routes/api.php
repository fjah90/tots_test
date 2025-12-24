<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Sistema de Reservación de Espacios - API REST
| Versión: 1.0.0
|
*/

// ============================================================================
// RUTAS PÚBLICAS (Sin autenticación)
// ============================================================================

// Rate limiting: 5 intentos por minuto para prevenir ataques de fuerza bruta
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Espacios - Lectura pública
Route::get('spaces', [SpaceController::class, 'index']);
Route::get('spaces/{space}', [SpaceController::class, 'show']);
Route::get('spaces/{space}/availability', [SpaceController::class, 'availability']);
Route::get('spaces/{space}/reservations', [SpaceController::class, 'reservations']);

// Calendario público - Ver todas las reservaciones para disponibilidad
Route::get('calendar/reservations', [ReservationController::class, 'calendarPublic']);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });

    // Espacios - Solo Admin puede crear, actualizar, eliminar
    Route::middleware('role:admin')->group(function () {
        Route::post('spaces', [SpaceController::class, 'store']);
        Route::put('spaces/{space}', [SpaceController::class, 'update']);
        Route::delete('spaces/{space}', [SpaceController::class, 'destroy']);

        // Usuarios - Lista para seleccionar en formularios admin
        Route::get('users', [AuthController::class, 'listUsers']);

        // Admin Stats - Dashboard
        Route::get('admin/stats', [StatsController::class, 'adminStats']);
    });

    // Reservaciones - CRUD completo para usuarios autenticados
    Route::post('reservations/bulk', [ReservationController::class, 'storeBulk']); // Debe ir antes del apiResource
    Route::apiResource('reservations', ReservationController::class);
    Route::patch('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);

    // ========================================================================
    // ESTADÍSTICAS - Funcionalidad Adicional (Solo Admin)
    // ========================================================================
    Route::prefix('stats')->middleware('role:admin')->group(function () {
        Route::get('dashboard', [StatsController::class, 'dashboard']);
        Route::get('space/{space}', [StatsController::class, 'spaceStats']);
    });
});
