<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservationControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test authenticated user can list their reservations.
     */
    public function test_authenticated_user_can_list_their_reservations(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();

        Reservation::factory()->count(3)->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    /**
     * Test admin can list all reservations.
     */
    public function test_admin_can_list_all_reservations(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create();

        Reservation::factory()->create(['user_id' => $user1->id, 'space_id' => $space->id]);
        Reservation::factory()->create(['user_id' => $user2->id, 'space_id' => $space->id]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test user only sees their own reservations.
     */
    public function test_user_only_sees_their_own_reservations(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create();

        Reservation::factory()->count(2)->create(['user_id' => $user1->id, 'space_id' => $space->id]);
        Reservation::factory()->create(['user_id' => $user2->id, 'space_id' => $space->id]);

        $response = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/reservations');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    /**
     * Test unauthenticated user cannot list reservations.
     */
    public function test_unauthenticated_user_cannot_list_reservations(): void
    {
        $response = $this->getJson('/api/reservations');

        $response->assertStatus(401);
    }

    /**
     * Test user can create a reservation.
     */
    public function test_user_can_create_a_reservation(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['is_active' => true]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reservations', [
                'space_id' => $space->id,
                'start_time' => '2025-12-25 09:00:00',
                'end_time' => '2025-12-25 12:00:00',
                'notes' => 'Reunión de equipo',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Reservación creada exitosamente',
                'data' => [
                    'space_id' => $space->id,
                    'user_id' => $user->id,
                    'status' => 'confirmed',
                ],
            ]);

        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'space_id' => $space->id,
        ]);
    }

    /**
     * Test reservation fails when space is not available.
     */
    public function test_reservation_fails_when_space_is_not_available(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create(['is_active' => true]);

        // Create existing reservation
        Reservation::factory()->create([
            'user_id' => $user1->id,
            'space_id' => $space->id,
            'start_time' => '2025-12-25 09:00:00',
            'end_time' => '2025-12-25 12:00:00',
            'status' => 'confirmed',
        ]);

        // Try to create overlapping reservation
        $response = $this->actingAs($user2, 'sanctum')
            ->postJson('/api/reservations', [
                'space_id' => $space->id,
                'start_time' => '2025-12-25 10:00:00',
                'end_time' => '2025-12-25 14:00:00',
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'message' => 'El espacio no está disponible en el horario solicitado',
                'error' => 'space_not_available',
            ]);
    }

    /**
     * Test reservation fails for inactive space.
     */
    public function test_reservation_fails_for_inactive_space(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reservations', [
                'space_id' => $space->id,
                'start_time' => '2025-12-25 09:00:00',
                'end_time' => '2025-12-25 12:00:00',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'El espacio no está disponible para reservaciones',
            ]);
    }

    /**
     * Test reservation fails with past date.
     */
    public function test_reservation_fails_with_past_date(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create(['is_active' => true]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/reservations', [
                'space_id' => $space->id,
                'start_time' => '2020-01-01 09:00:00',
                'end_time' => '2020-01-01 12:00:00',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_time']);
    }

    /**
     * Test user can view their own reservation.
     */
    public function test_user_can_view_their_own_reservation(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();
        $reservation = Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(200)
            ->assertJson(['id' => $reservation->id]);
    }

    /**
     * Test user cannot view another user's reservation.
     */
    public function test_user_cannot_view_another_users_reservation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create();

        $reservation = Reservation::factory()->create([
            'user_id' => $user1->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user2, 'sanctum')
            ->getJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(403);
    }

    /**
     * Test admin can view any reservation.
     */
    public function test_admin_can_view_any_reservation(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $space = Space::factory()->create();

        $reservation = Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(200);
    }

    /**
     * Test user can update their own reservation.
     */
    public function test_user_can_update_their_own_reservation(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();
        $reservation = Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'start_time' => '2025-12-25 09:00:00',
            'end_time' => '2025-12-25 12:00:00',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/reservations/{$reservation->id}", [
                'notes' => 'Notas actualizadas',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Reservación actualizada exitosamente',
            ]);

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'notes' => 'Notas actualizadas',
        ]);
    }

    /**
     * Test user cannot update another user's reservation.
     */
    public function test_user_cannot_update_another_users_reservation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create();

        $reservation = Reservation::factory()->create([
            'user_id' => $user1->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user2, 'sanctum')
            ->putJson("/api/reservations/{$reservation->id}", [
                'notes' => 'Intento de actualización',
            ]);

        $response->assertStatus(403);
    }

    /**
     * Test user can delete their own reservation.
     */
    public function test_user_can_delete_their_own_reservation(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();
        $reservation = Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(200)
            ->assertJson(['message' => 'Reservación eliminada exitosamente']);

        $this->assertSoftDeleted('reservations', ['id' => $reservation->id]);
    }

    /**
     * Test user cannot delete another user's reservation.
     */
    public function test_user_cannot_delete_another_users_reservation(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $space = Space::factory()->create();

        $reservation = Reservation::factory()->create([
            'user_id' => $user1->id,
            'space_id' => $space->id,
        ]);

        $response = $this->actingAs($user2, 'sanctum')
            ->deleteJson("/api/reservations/{$reservation->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can cancel their own reservation.
     */
    public function test_user_can_cancel_their_own_reservation(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();
        $reservation = Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/reservations/{$reservation->id}/cancel");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Reservación cancelada exitosamente',
                'data' => [
                    'status' => 'cancelled',
                ],
            ]);
    }

    /**
     * Test reservations can be filtered by status.
     */
    public function test_reservations_can_be_filtered_by_status(): void
    {
        $user = User::factory()->create();
        $space = Space::factory()->create();

        Reservation::factory()->count(2)->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'status' => 'confirmed',
        ]);

        Reservation::factory()->create([
            'user_id' => $user->id,
            'space_id' => $space->id,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/reservations?status=confirmed');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }
}
