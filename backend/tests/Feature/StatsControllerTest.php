<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatsControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test admin can access dashboard stats.
     */
    public function test_admin_can_access_dashboard_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create();
        Space::factory()->count(3)->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/stats/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'summary' => [
                    'total_users',
                    'total_spaces',
                    'total_reservations',
                    'active_spaces',
                    'confirmed_reservations',
                    'cancelled_reservations',
                ],
                'top_spaces',
                'recent_reservations',
                'reservations_by_status',
                'reservations_by_month',
            ]);
    }

    /**
     * Test regular user cannot access dashboard stats.
     */
    public function test_regular_user_cannot_access_dashboard_stats(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/stats/dashboard');

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated user cannot access dashboard stats.
     */
    public function test_unauthenticated_user_cannot_access_dashboard_stats(): void
    {
        $response = $this->getJson('/api/stats/dashboard');

        $response->assertStatus(401);
    }

    /**
     * Test admin can access space stats.
     */
    public function test_admin_can_access_space_stats(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $space = Space::factory()->create();

        Reservation::factory()->count(5)->create([
            'space_id' => $space->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/stats/space/{$space->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'space' => ['id', 'name'],
                'stats' => [
                    'total_reservations',
                    'confirmed_reservations',
                    'cancelled_reservations',
                    'occupancy_rate',
                    'unique_users',
                ],
                'upcoming_reservations',
            ]);
    }

    /**
     * Test regular user cannot access space stats.
     */
    public function test_regular_user_cannot_access_space_stats(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $space = Space::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/stats/space/{$space->id}");

        $response->assertStatus(403);
    }

    /**
     * Test dashboard stats are accurate.
     */
    public function test_dashboard_stats_are_accurate(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Space::factory()->count(3)->create(['is_active' => true]);
        Space::factory()->create(['is_active' => false]); // Total: 4 spaces, 3 active

        $space = Space::first();
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        Reservation::factory()->count(2)->create([
            'user_id' => $user1->id,
            'space_id' => $space->id,
            'status' => 'confirmed',
        ]);
        Reservation::factory()->create([
            'user_id' => $user2->id,
            'space_id' => $space->id,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/stats/dashboard');

        $response->assertStatus(200);
        
        // Verificar estructura y valores correctos
        $data = $response->json();
        $this->assertEquals(4, $data['summary']['total_spaces']);
        $this->assertEquals(3, $data['summary']['active_spaces']);
        $this->assertEquals(3, $data['summary']['total_reservations']);
        $this->assertEquals(2, $data['summary']['confirmed_reservations']);
        $this->assertEquals(1, $data['summary']['cancelled_reservations']);
    }
}
