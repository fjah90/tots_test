<?php

namespace Tests\Unit;

use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test Unitario para AvailabilityService.
 * 
 * Prueba exhaustiva de la lógica de detección de solapamiento:
 * (StartA < EndB) AND (EndA > StartB)
 */
class AvailabilityServiceTest extends TestCase
{
    use RefreshDatabase;

    private AvailabilityService $service;
    private Space $space;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->service = new AvailabilityService();
        $this->user = User::factory()->create();
        $this->space = Space::factory()->create(['is_active' => true]);
    }

    /**
     * Test: Espacio sin reservas está disponible.
     */
    public function test_space_without_reservations_is_available(): void
    {
        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Espacio inactivo no está disponible.
     */
    public function test_inactive_space_is_not_available(): void
    {
        $inactiveSpace = Space::factory()->create(['is_active' => false]);

        $result = $this->service->isSpaceAvailable(
            $inactiveSpace->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Espacio inexistente no está disponible.
     */
    public function test_nonexistent_space_is_not_available(): void
    {
        $result = $this->service->isSpaceAvailable(
            99999,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertFalse($result);
    }

    /**
     * Test: End time antes de start time retorna no disponible.
     */
    public function test_invalid_time_range_is_not_available(): void
    {
        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 11:00:00',
            '2025-01-15 09:00:00' // end antes que start
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Reserva exactamente en el mismo horario - NO disponible.
     * 
     * Existente:  |-------|
     * Nueva:      |-------|
     */
    public function test_exact_overlap_is_not_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Nueva reserva comienza durante existente - NO disponible.
     * 
     * Existente:  |-------|
     * Nueva:          |-------|
     */
    public function test_new_starts_during_existing_is_not_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 10:00:00', // Comienza a las 10, durante la existente
            '2025-01-15 12:00:00'
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Nueva reserva termina durante existente - NO disponible.
     * 
     * Existente:      |-------|
     * Nueva:      |-------|
     */
    public function test_new_ends_during_existing_is_not_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 10:00:00',
            'end_time' => '2025-01-15 12:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00' // Termina a las 11, durante la existente
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Nueva reserva contiene completamente a la existente - NO disponible.
     * 
     * Existente:    |---|
     * Nueva:      |-------|
     */
    public function test_new_contains_existing_is_not_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 10:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 12:00:00' // Contiene la existente
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Nueva reserva está contenida en la existente - NO disponible.
     * 
     * Existente:  |-------|
     * Nueva:        |---|
     */
    public function test_new_inside_existing_is_not_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 12:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 10:00:00',
            '2025-01-15 11:00:00' // Dentro de la existente
        );

        $this->assertFalse($result);
    }

    /**
     * Test: Reserva inmediatamente antes - SÍ disponible (sin gap, no solapa).
     * 
     * Existente:           |-------|
     * Nueva:       |-------|
     */
    public function test_reservation_immediately_before_is_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 11:00:00',
            'end_time' => '2025-01-15 13:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00' // Termina exactamente cuando empieza la otra
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Reserva inmediatamente después - SÍ disponible.
     * 
     * Existente:  |-------|
     * Nueva:               |-------|
     */
    public function test_reservation_immediately_after_is_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 11:00:00', // Empieza exactamente cuando termina la otra
            '2025-01-15 13:00:00'
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Reserva en otro día - SÍ disponible.
     */
    public function test_reservation_on_different_day_is_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-16 09:00:00', // Diferente día
            '2025-01-16 11:00:00'
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Reserva cancelada no bloquea - SÍ disponible.
     */
    public function test_cancelled_reservation_does_not_block(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'cancelled', // Cancelada
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Excluir reserva específica (para updates).
     */
    public function test_exclude_reservation_allows_update(): void
    {
        $reservation = Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        // Sin excluir, no está disponible
        $resultWithoutExclude = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );
        $this->assertFalse($resultWithoutExclude);

        // Excluyendo la reserva, sí está disponible
        $resultWithExclude = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00',
            $reservation->id
        );
        $this->assertTrue($resultWithExclude);
    }

    /**
     * Test: Múltiples reservas - verificar gap entre ellas.
     * 
     * Reserva1:  |-------|
     * Reserva2:                    |-------|
     * Nueva:             |-------|
     */
    public function test_slot_between_multiple_reservations_is_available(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 08:00:00',
            'end_time' => '2025-01-15 09:00:00',
            'status' => 'confirmed',
        ]);

        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 11:00:00',
            'end_time' => '2025-01-15 12:00:00',
            'status' => 'confirmed',
        ]);

        // El slot entre 09:00 y 11:00 debe estar disponible
        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertTrue($result);
    }

    /**
     * Test: Acepta objetos Carbon como parámetros.
     */
    public function test_accepts_carbon_objects(): void
    {
        Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $start = Carbon::parse('2025-01-15 11:00:00');
        $end = Carbon::parse('2025-01-15 13:00:00');

        $result = $this->service->isSpaceAvailable(
            $this->space->id,
            $start,
            $end
        );

        $this->assertTrue($result);
    }

    /**
     * Test: getOverlappingReservations retorna las reservas en conflicto.
     */
    public function test_get_overlapping_reservations(): void
    {
        $reservation = Reservation::factory()->create([
            'space_id' => $this->space->id,
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $overlapping = $this->service->getOverlappingReservations(
            $this->space->id,
            '2025-01-15 10:00:00',
            '2025-01-15 12:00:00'
        );

        $this->assertCount(1, $overlapping);
        $this->assertEquals($reservation->id, $overlapping->first()->id);
    }

    /**
     * Test: Reserva en diferente espacio - SÍ disponible.
     */
    public function test_reservation_in_different_space_is_available(): void
    {
        $otherSpace = Space::factory()->create(['is_active' => true]);

        Reservation::factory()->create([
            'space_id' => $otherSpace->id, // Diferente espacio
            'user_id' => $this->user->id,
            'start_time' => '2025-01-15 09:00:00',
            'end_time' => '2025-01-15 11:00:00',
            'status' => 'confirmed',
        ]);

        $result = $this->service->isSpaceAvailable(
            $this->space->id, // Nuestro espacio
            '2025-01-15 09:00:00',
            '2025-01-15 11:00:00'
        );

        $this->assertTrue($result);
    }
}
