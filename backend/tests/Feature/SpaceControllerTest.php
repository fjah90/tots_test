<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpaceControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test anyone can list spaces.
     */
    public function test_anyone_can_list_spaces(): void
    {
        Space::factory()->count(3)->create();

        $response = $this->getJson('/api/spaces');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'capacity', 'location', 'is_active'],
                ],
            ])
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test spaces can be filtered by capacity.
     */
    public function test_spaces_can_be_filtered_by_capacity(): void
    {
        Space::factory()->create(['capacity' => 10]);
        Space::factory()->create(['capacity' => 50]);
        Space::factory()->create(['capacity' => 100]);

        $response = $this->getJson('/api/spaces?capacity_min=40');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test spaces can be filtered by active status.
     */
    public function test_spaces_can_be_filtered_by_active_status(): void
    {
        Space::factory()->count(2)->create(['is_active' => true]);
        Space::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/spaces?is_active=true');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test spaces can be searched by name.
     */
    public function test_spaces_can_be_searched_by_name(): void
    {
        Space::factory()->create(['name' => 'Sala de Conferencias']);
        Space::factory()->create(['name' => 'Auditorio Principal']);
        Space::factory()->create(['name' => 'Sala de Reuniones']);

        $response = $this->getJson('/api/spaces?search=Sala');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test anyone can view a space.
     */
    public function test_anyone_can_view_a_space(): void
    {
        $space = Space::factory()->create();

        $response = $this->getJson("/api/spaces/{$space->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $space->id,
                'name' => $space->name,
            ]);
    }

    /**
     * Test admin can create a space.
     */
    public function test_admin_can_create_a_space(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/spaces', [
                'name' => 'Nueva Sala',
                'description' => 'Una sala de prueba',
                'capacity' => 25,
                'location' => 'Edificio A',
                'amenities' => ['WiFi', 'Proyector'],
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Espacio creado exitosamente',
                'data' => [
                    'name' => 'Nueva Sala',
                    'capacity' => 25,
                ],
            ]);

        $this->assertDatabaseHas('spaces', ['name' => 'Nueva Sala']);
    }

    /**
     * Test regular user cannot create a space.
     */
    public function test_regular_user_cannot_create_a_space(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/spaces', [
                'name' => 'Nueva Sala',
                'capacity' => 25,
                'location' => 'Edificio A',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test unauthenticated user cannot create a space.
     */
    public function test_unauthenticated_user_cannot_create_a_space(): void
    {
        $response = $this->postJson('/api/spaces', [
            'name' => 'Nueva Sala',
            'capacity' => 25,
            'location' => 'Edificio A',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test admin can update a space.
     */
    public function test_admin_can_update_a_space(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $space = Space::factory()->create(['name' => 'Sala Original']);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/spaces/{$space->id}", [
                'name' => 'Sala Actualizada',
                'capacity' => 50,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Espacio actualizado exitosamente',
                'data' => [
                    'name' => 'Sala Actualizada',
                    'capacity' => 50,
                ],
            ]);
    }

    /**
     * Test regular user cannot update a space.
     */
    public function test_regular_user_cannot_update_a_space(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $space = Space::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/spaces/{$space->id}", [
                'name' => 'Intento de actualización',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test admin can delete a space.
     */
    public function test_admin_can_delete_a_space(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $space = Space::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/spaces/{$space->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Espacio eliminado exitosamente']);

        $this->assertSoftDeleted('spaces', ['id' => $space->id]);
    }

    /**
     * Test regular user cannot delete a space.
     */
    public function test_regular_user_cannot_delete_a_space(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $space = Space::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/spaces/{$space->id}");

        $response->assertStatus(403);
    }

    /**
     * Test space availability check works.
     */
    public function test_space_availability_check_returns_available(): void
    {
        $space = Space::factory()->create();

        $response = $this->getJson("/api/spaces/{$space->id}/availability?" . http_build_query([
            'start_time' => '2025-12-25 09:00:00',
            'end_time' => '2025-12-25 12:00:00',
        ]));

        $response->assertStatus(200)
            ->assertJson(['available' => true]);
    }

    /**
     * Test space availability check returns unavailable when overlapping.
     */
    public function test_space_availability_returns_unavailable_when_overlapping(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();

        Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'start_time' => '2025-12-25 09:00:00',
            'end_time' => '2025-12-25 12:00:00',
            'status' => 'confirmed',
        ]);

        $response = $this->getJson("/api/spaces/{$space->id}/availability?" . http_build_query([
            'start_time' => '2025-12-25 10:00:00',
            'end_time' => '2025-12-25 14:00:00',
        ]));

        $response->assertStatus(200)
            ->assertJson(['available' => false]);
    }
}
