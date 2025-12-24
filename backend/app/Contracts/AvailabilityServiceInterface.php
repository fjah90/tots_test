<?php

namespace App\Contracts;

use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Interface para el servicio de disponibilidad de espacios.
 * 
 * Siguiendo el principio ISP (Interface Segregation Principle),
 * esta interfaz define solo los métodos necesarios para verificar
 * disponibilidad de espacios.
 * 
 * @package App\Contracts
 */
interface AvailabilityServiceInterface
{
    /**
     * Verificar si un espacio está disponible en un rango de tiempo.
     * 
     * @param int $spaceId ID del espacio a verificar
     * @param string|Carbon $start Fecha/hora de inicio
     * @param string|Carbon $end Fecha/hora de fin
     * @param int|null $excludeReservationId ID de reserva a excluir (para updates)
     * @return bool True si está disponible, False si hay conflicto
     */
    public function isSpaceAvailable(
        int $spaceId,
        string|Carbon $start,
        string|Carbon $end,
        ?int $excludeReservationId = null
    ): bool;

    /**
     * Obtener las reservas que solapan con un rango de tiempo.
     * 
     * @param int $spaceId ID del espacio
     * @param string|Carbon $start Fecha/hora de inicio
     * @param string|Carbon $end Fecha/hora de fin
     * @param int|null $excludeReservationId ID de reserva a excluir
     * @return Collection Colección de reservas en conflicto
     */
    public function getOverlappingReservations(
        int $spaceId,
        string|Carbon $start,
        string|Carbon $end,
        ?int $excludeReservationId = null
    ): Collection;

    /**
     * Obtener slots disponibles para un espacio en una fecha.
     * 
     * @param int $spaceId ID del espacio
     * @param string|Carbon $date Fecha a consultar
     * @param int $slotDurationMinutes Duración de cada slot en minutos
     * @return array Array de slots disponibles
     */
    public function getAvailableSlots(
        int $spaceId,
        string|Carbon $date,
        int $slotDurationMinutes = 60
    ): array;
}
