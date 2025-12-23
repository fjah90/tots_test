<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Requests\UpdateReservationRequest;
use App\Models\Reservation;
use App\Models\Space;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class ReservationController extends Controller
{
    /**
     * Constructor con inyección de dependencias.
     */
    public function __construct(
        protected AvailabilityService $availabilityService
    ) {}

    /**
     * @OA\Get(
     *     path="/reservations",
     *     summary="Listar reservaciones del usuario autenticado",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filtrar por estado",
     *         @OA\Schema(type="string", enum={"confirmed", "cancelled", "pending"})
     *     ),
     *     @OA\Parameter(
     *         name="from_date",
     *         in="query",
     *         description="Desde fecha (Y-m-d)",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="to_date",
     *         in="query",
     *         description="Hasta fecha (Y-m-d)",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de reservaciones",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Reservation")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = $user->isAdmin() 
            ? Reservation::with(['user', 'space'])
            : $user->reservations()->with('space');

        // Filtro por estado
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por rango de fechas
        if ($request->has('from_date')) {
            $query->whereDate('start_time', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('end_time', '<=', $request->to_date);
        }

        $reservations = $query->orderBy('start_time', 'desc')->get();

        return response()->json([
            'data' => $reservations,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/reservations/{id}",
     *     summary="Obtener detalle de una reservación",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la reservación",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalle de la reservación",
     *         @OA\JsonContent(ref="#/components/schemas/Reservation")
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Reservación no encontrada")
     * )
     */
    public function show(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Solo el dueño o un admin puede ver la reservación
        if (!$user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado para ver esta reservación',
            ], 403);
        }

        return response()->json($reservation->load(['user', 'space']));
    }

    /**
     * @OA\Post(
     *     path="/reservations",
     *     summary="Crear nueva reservación",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"space_id","start_time","end_time"},
     *             @OA\Property(property="space_id", type="integer", example=1),
     *             @OA\Property(property="start_time", type="string", format="datetime", example="2025-01-20 09:00:00"),
     *             @OA\Property(property="end_time", type="string", format="datetime", example="2025-01-20 12:00:00"),
     *             @OA\Property(property="notes", type="string", example="Reunión de equipo de desarrollo")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Reservación creada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Reservación creada exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Reservation")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=409, description="Conflicto - El espacio no está disponible"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $space = Space::findOrFail($validated['space_id']);

        // Verificar que el espacio esté activo
        if (!$space->is_active) {
            return response()->json([
                'message' => 'El espacio no está disponible para reservaciones',
                'error' => 'space_inactive',
            ], 422);
        }

        // Verificar disponibilidad usando el servicio dedicado
        if (!$this->availabilityService->isSpaceAvailable(
            $validated['space_id'],
            $validated['start_time'],
            $validated['end_time']
        )) {
            // Obtener las reservas en conflicto para información adicional
            $conflicting = $this->availabilityService->getOverlappingReservations(
                $validated['space_id'],
                $validated['start_time'],
                $validated['end_time']
            );

            return response()->json([
                'message' => 'El espacio no está disponible en el horario solicitado',
                'error' => 'space_not_available',
                'conflicting_reservations' => $conflicting->map(fn($r) => [
                    'id' => $r->id,
                    'start_time' => $r->start_time,
                    'end_time' => $r->end_time,
                ]),
            ], 409);
        }

        // Si es admin y proporciona user_id, usarlo; de lo contrario, usar el usuario autenticado
        $userId = $request->user()->isAdmin() && isset($validated['user_id'])
            ? $validated['user_id']
            : $request->user()->id;

        $reservation = Reservation::create([
            ...$validated,
            'user_id' => $userId,
            'status' => $validated['status'] ?? 'confirmed',
        ]);

        return response()->json([
            'message' => 'Reservación creada exitosamente',
            'data' => $reservation->load(['user', 'space']),
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/reservations/{id}",
     *     summary="Actualizar reservación",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la reservación",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="start_time", type="string", format="datetime"),
     *             @OA\Property(property="end_time", type="string", format="datetime"),
     *             @OA\Property(property="notes", type="string"),
     *             @OA\Property(property="status", type="string", enum={"confirmed", "cancelled", "pending"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reservación actualizada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Reservación actualizada exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Reservation")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Reservación no encontrada"),
     *     @OA\Response(response=409, description="Conflicto de horario")
     * )
     */
    public function update(UpdateReservationRequest $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Solo el dueño o un admin puede actualizar
        if (!$user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado para actualizar esta reservación',
            ], 403);
        }

        $validated = $request->validated();

        // Si cambian los horarios, verificar disponibilidad
        $startTime = $validated['start_time'] ?? $reservation->start_time;
        $endTime = $validated['end_time'] ?? $reservation->end_time;

        if (isset($validated['start_time']) || isset($validated['end_time'])) {
            if (!$this->availabilityService->isSpaceAvailable(
                $reservation->space_id,
                $startTime,
                $endTime,
                $reservation->id // Excluir la reserva actual
            )) {
                return response()->json([
                    'message' => 'El espacio no está disponible en el nuevo horario solicitado',
                    'error' => 'space_not_available',
                ], 409);
            }
        }

        $reservation->update($validated);

        return response()->json([
            'message' => 'Reservación actualizada exitosamente',
            'data' => $reservation->fresh()->load(['user', 'space']),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/reservations/{id}",
     *     summary="Cancelar/eliminar reservación",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la reservación",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reservación eliminada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Reservación eliminada exitosamente")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Reservación no encontrada")
     * )
     */
    public function destroy(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        // Solo el dueño o un admin puede eliminar
        if (!$user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado para eliminar esta reservación',
            ], 403);
        }

        $reservation->delete();

        return response()->json([
            'message' => 'Reservación eliminada exitosamente',
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/reservations/{id}/cancel",
     *     summary="Cancelar una reservación (cambiar estado)",
     *     tags={"Reservations"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la reservación",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Reservación cancelada",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Reservación cancelada exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Reservation")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Reservación no encontrada")
     * )
     */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $reservation->user_id !== $user->id) {
            return response()->json([
                'message' => 'No autorizado para cancelar esta reservación',
            ], 403);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Reservación cancelada exitosamente',
            'data' => $reservation->fresh()->load(['user', 'space']),
        ]);
    }
}
