<?php

use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Registrar middleware de verificación de rol
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Manejo seguro de excepciones para API (no exponer detalles internos)
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Recurso no encontrado',
                    'error' => 'not_found',
                ], 404);
            }
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Método HTTP no permitido',
                    'error' => 'method_not_allowed',
                ], 405);
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'No autenticado',
                    'error' => 'unauthenticated',
                ], 401);
            }
        });

        // Capturar excepciones genéricas en producción (solo errores reales del servidor)
        $exceptions->render(function (\Throwable $e, Request $request) {
            // No interceptar excepciones que Laravel ya maneja correctamente
            if ($e instanceof ValidationException ||
                $e instanceof NotFoundHttpException ||
                $e instanceof MethodNotAllowedHttpException ||
                $e instanceof AuthenticationException ||
                $e instanceof \Illuminate\Auth\Access\AuthorizationException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                return null; // Dejar que Laravel maneje estas excepciones normalmente
            }

            if ($request->is('api/*') || $request->expectsJson()) {
                // Solo mostrar detalles en desarrollo
                if (config('app.debug')) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'error' => class_basename($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                        'trace' => collect($e->getTrace())->take(5)->toArray(),
                    ], 500);
                }

                // En producción: log del error y respuesta genérica
                Log::error('API Exception', [
                    'exception' => class_basename($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'ip' => $request->ip(),
                ]);

                return response()->json([
                    'message' => 'Error interno del servidor',
                    'error' => 'server_error',
                ], 500);
            }
        });
    })->create();
