<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Space;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Servicio para gestionar la disponibilidad de espacios.
 * 
 * Implementa la lógica de detección de solapamiento de reservas
 * usando el algoritmo: (StartA < EndB) AND (EndA > StartB)
 * 
 * @package App\Services
 */
class AvailabilityService
{
    /**
     * Verificar si un espacio está disponible en un rango de tiempo.
     * 
     * La lógica de solapamiento detecta cuando:
     * - Una reserva existente comienza antes de que termine la nueva (StartA < EndB)
     * - Y la reserva existente termina después de que comience la nueva (EndA > StartB)
     * 
     * Ejemplo visual:
     * Reserva existente:  |----A----|
     * Nueva reserva:           |----B----|
     * Solapamiento:            |XXXX|
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
    ): bool {
        // Normalizar a Carbon para manejo consistente
        $startTime = $start instanceof Carbon ? $start : Carbon::parse($start);
        $endTime = $end instanceof Carbon ? $end : Carbon::parse($end);

        // Validación básica: end debe ser posterior a start
        if ($endTime->lte($startTime)) {
            return false;
        }

        // Verificar que el espacio existe y está activo
        $space = Space::find($spaceId);
        if (!$space || !$space->is_active) {
            return false;
        }

        // Query para detectar solapamiento
        // Algoritmo: (StartA < EndB) AND (EndA > StartB)
        $query = Reservation::where('space_id', $spaceId)
            ->where('status', '!=', 'cancelled') // Solo reservas activas
            ->where(function ($q) use ($startTime, $endTime) {
                // Detectar solapamiento
                $q->where('start_time', '<', $endTime->toDateTimeString())
                  ->where('end_time', '>', $startTime->toDateTimeString());
            });

        // Excluir reserva específica (útil para updates)
        if ($excludeReservationId !== null) {
            $query->where('id', '!=', $excludeReservationId);
        }

        // Si no existe ninguna reserva que solape, el espacio está disponible
        return $query->doesntExist();
    }

    /**
     * Obtener las reservas que solapan con un rango de tiempo.
     * 
     * Útil para mostrar al usuario qué reservas están en conflicto.
     * 
     * @param int $spaceId
     * @param string|Carbon $start
     * @param string|Carbon $end
     * @param int|null $excludeReservationId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getOverlappingReservations(
        int $spaceId,
        string|Carbon $start,
        string|Carbon $end,
        ?int $excludeReservationId = null
    ) {
        $startTime = $start instanceof Carbon ? $start : Carbon::parse($start);
        $endTime = $end instanceof Carbon ? $end : Carbon::parse($end);

        $query = Reservation::with(['user', 'space'])
            ->where('space_id', $spaceId)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime->toDateTimeString())
                  ->where('end_time', '>', $startTime->toDateTimeString());
            });

        if ($excludeReservationId !== null) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return $query->get();
    }

    /**
     * Obtener slots disponibles para un espacio en un día específico.
     * 
     * @param int $spaceId
     * @param string|Carbon $date Fecha a consultar
     * @param int $slotDurationMinutes Duración de cada slot en minutos
     * @param string $dayStart Hora de inicio del día (formato H:i)
     * @param string $dayEnd Hora de fin del día (formato H:i)
     * @return array Lista de slots disponibles con start y end
     */
    public function getAvailableSlots(
        int $spaceId,
        string|Carbon $date,
        int $slotDurationMinutes = 60,
        string $dayStart = '08:00',
        string $dayEnd = '20:00'
    ): array {
        $dateCarbon = $date instanceof Carbon ? $date : Carbon::parse($date);
        
        $startOfDay = $dateCarbon->copy()->setTimeFromTimeString($dayStart);
        $endOfDay = $dateCarbon->copy()->setTimeFromTimeString($dayEnd);

        // Obtener todas las reservas del día
        $reservations = Reservation::where('space_id', $spaceId)
            ->where('status', '!=', 'cancelled')
            ->whereDate('start_time', $dateCarbon->toDateString())
            ->orderBy('start_time')
            ->get(['start_time', 'end_time']);

        $availableSlots = [];
        $currentTime = $startOfDay->copy();

        while ($currentTime->lt($endOfDay)) {
            $slotEnd = $currentTime->copy()->addMinutes($slotDurationMinutes);
            
            if ($slotEnd->gt($endOfDay)) {
                break;
            }

            // Verificar si este slot está disponible
            $isAvailable = true;
            foreach ($reservations as $reservation) {
                $resStart = Carbon::parse($reservation->start_time);
                $resEnd = Carbon::parse($reservation->end_time);

                // Verificar solapamiento
                if ($currentTime->lt($resEnd) && $slotEnd->gt($resStart)) {
                    $isAvailable = false;
                    break;
                }
            }

            if ($isAvailable) {
                $availableSlots[] = [
                    'start' => $currentTime->toDateTimeString(),
                    'end' => $slotEnd->toDateTimeString(),
                ];
            }

            $currentTime->addMinutes($slotDurationMinutes);
        }

        return $availableSlots;
    }
}
