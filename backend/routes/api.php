<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\SpaceController;
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

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Espacios - Lectura pública
Route::get('spaces', [SpaceController::class, 'index']);
Route::get('spaces/{space}', [SpaceController::class, 'show']);
Route::get('spaces/{space}/availability', [SpaceController::class, 'availability']);

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
    Route::post('spaces', [SpaceController::class, 'store']);
    Route::put('spaces/{space}', [SpaceController::class, 'update']);
    Route::delete('spaces/{space}', [SpaceController::class, 'destroy']);

    // Reservaciones - CRUD completo para usuarios autenticados
    Route::apiResource('reservations', ReservationController::class);
    Route::patch('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
});
