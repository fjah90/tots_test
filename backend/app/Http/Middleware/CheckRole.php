<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para verificar el rol del usuario autenticado.
 *
 * Uso en rutas:
 *   Route::middleware(['auth:sanctum', 'role:admin'])->group(...)
 *   Route::middleware(['auth:sanctum', 'role:admin,moderator'])->group(...)
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles  Roles permitidos separados por coma (ej: "admin,moderator")
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        $user = $request->user();

        // Si no hay usuario autenticado
        if (! $user) {
            return response()->json([
                'message' => 'No autenticado',
                'error' => 'unauthenticated',
            ], 401);
        }

        // Parsear roles permitidos
        $allowedRoles = array_map('trim', explode(',', $roles));

        // Verificar si el usuario tiene alguno de los roles permitidos
        if (! in_array($user->role, $allowedRoles, true)) {
            return response()->json([
                'message' => 'No tiene permisos para acceder a este recurso',
                'error' => 'forbidden',
                'required_roles' => $allowedRoles,
            ], 403);
        }

        return $next($request);
    }
}
