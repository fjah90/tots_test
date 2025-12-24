<?php

namespace Tests\Unit;

use App\Http\Middleware\CheckRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class CheckRoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Usuario admin pasa el middleware.
     */
    public function test_admin_user_passes_middleware(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $admin);

        $middleware = new CheckRole;

        $response = $middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'admin');

        $this->assertEquals(200, $response->getStatusCode());
    }

    /**
     * Test: Usuario regular no pasa middleware de admin.
     */
    public function test_regular_user_fails_admin_middleware(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckRole;

        $response = $middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'admin');

        $this->assertEquals(403, $response->getStatusCode());
        $this->assertStringContainsString('No tiene permisos', $response->getContent());
    }

    /**
     * Test: Usuario no autenticado retorna 401.
     */
    public function test_unauthenticated_user_returns_401(): void
    {
        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => null);

        $middleware = new CheckRole;

        $response = $middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'admin');

        $this->assertEquals(401, $response->getStatusCode());
    }

    /**
     * Test: Múltiples roles permitidos.
     */
    public function test_multiple_roles_allowed(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(fn () => $user);

        $middleware = new CheckRole;

        // Permitir tanto admin como user
        $response = $middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        }, 'admin,user');

        $this->assertEquals(200, $response->getStatusCode());
    }
}
