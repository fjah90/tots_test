<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeleteSpaceRequest;
use App\Http\Requests\StoreSpaceRequest;
use App\Http\Requests\UpdateSpaceRequest;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class SpaceController extends Controller
{
    /**
     * @OA\Get(
     *     path="/spaces",
     *     summary="Listar todos los espacios",
     *     tags={"Spaces"},
     *     @OA\Parameter(
     *         name="capacity_min",
     *         in="query",
     *         description="Capacidad mínima",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="capacity_max",
     *         in="query",
     *         description="Capacidad máxima",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="is_active",
     *         in="query",
     *         description="Filtrar por estado activo",
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Buscar por nombre o ubicación",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="available_date",
     *         in="query",
     *         description="Filtrar por disponibilidad en fecha (YYYY-MM-DD)",
     *         @OA\Schema(type="string", format="date", example="2025-01-15")
     *     ),
     *     @OA\Parameter(
     *         name="available_start_time",
     *         in="query",
     *         description="Hora inicio para filtro de disponibilidad (HH:mm)",
     *         @OA\Schema(type="string", example="09:00")
     *     ),
     *     @OA\Parameter(
     *         name="available_end_time",
     *         in="query",
     *         description="Hora fin para filtro de disponibilidad (HH:mm)",
     *         @OA\Schema(type="string", example="12:00")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número de página para paginación",
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Elementos por página (0 = todos)",
     *         @OA\Schema(type="integer", default=0)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de espacios",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Space")
     *             ),
     *             @OA\Property(property="meta", type="object",
     *                 @OA\Property(property="current_page", type="integer"),
     *                 @OA\Property(property="per_page", type="integer"),
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="last_page", type="integer")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Space::query();

        // Filtro por capacidad mínima
        if ($request->has('capacity_min')) {
            $query->where('capacity', '>=', $request->capacity_min);
        }

        // Filtro por capacidad máxima
        if ($request->has('capacity_max')) {
            $query->where('capacity', '<=', $request->capacity_max);
        }

        // Filtro por estado activo
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        // Búsqueda por nombre o ubicación
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filtro por disponibilidad en fecha y hora específica
        if ($request->has('available_date')) {
            $date = $request->available_date;
            $startTime = $request->get('available_start_time', '08:00');
            $endTime = $request->get('available_end_time', '20:00');
            
            $startDateTime = "{$date} {$startTime}:00";
            $endDateTime = "{$date} {$endTime}:00";
            
            // Excluir espacios que tengan reservaciones que se solapen con el horario solicitado
            $query->whereDoesntHave('reservations', function ($rq) use ($startDateTime, $endDateTime) {
                $rq->whereIn('status', ['confirmed', 'pending'])
                   ->where('start_time', '<', $endDateTime)
                   ->where('end_time', '>', $startDateTime);
            });
        }

        $query->orderBy('name');

        // Paginación opcional (per_page=0 retorna todos)
        $perPage = (int) $request->get('per_page', 0);
        
        if ($perPage > 0) {
            $paginated = $query->paginate($perPage);
            
            return response()->json([
                'data' => $paginated->items(),
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                ]
            ]);
        }

        // Sin paginación (comportamiento original)
        $spaces = $query->get();

        return response()->json([
            'data' => $spaces,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/spaces/{id}",
     *     summary="Obtener detalle de un espacio",
     *     tags={"Spaces"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del espacio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalle del espacio",
     *         @OA\JsonContent(ref="#/components/schemas/Space")
     *     ),
     *     @OA\Response(response=404, description="Espacio no encontrado")
     * )
     */
    public function show(Space $space): JsonResponse
    {
        return response()->json($space->load('reservations'));
    }

    /**
     * @OA\Post(
     *     path="/spaces",
     *     summary="Crear nuevo espacio (Solo Admin)",
     *     tags={"Spaces"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","capacity","location"},
     *             @OA\Property(property="name", type="string", example="Nueva Sala de Juntas"),
     *             @OA\Property(property="description", type="string", example="Sala moderna con equipamiento"),
     *             @OA\Property(property="capacity", type="integer", example=15),
     *             @OA\Property(property="location", type="string", example="Edificio D - Piso 1"),
     *             @OA\Property(property="amenities", type="array", @OA\Items(type="string"), example={"WiFi", "Proyector"}),
     *             @OA\Property(property="image_url", type="string", example="https://example.com/sala.jpg"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Espacio creado exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Espacio creado exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Space")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado (solo admin)"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function store(StoreSpaceRequest $request): JsonResponse
    {
        $space = Space::create($request->validated());

        return response()->json([
            'message' => 'Espacio creado exitosamente',
            'data' => $space,
        ], 201);
    }

    /**
     * @OA\Put(
     *     path="/spaces/{id}",
     *     summary="Actualizar espacio (Solo Admin)",
     *     tags={"Spaces"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del espacio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Sala Actualizada"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="capacity", type="integer", example=20),
     *             @OA\Property(property="location", type="string"),
     *             @OA\Property(property="amenities", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="image_url", type="string"),
     *             @OA\Property(property="is_active", type="boolean")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Espacio actualizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Espacio actualizado exitosamente"),
     *             @OA\Property(property="data", ref="#/components/schemas/Space")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Espacio no encontrado")
     * )
     */
    public function update(UpdateSpaceRequest $request, Space $space): JsonResponse
    {
        $space->update($request->validated());

        return response()->json([
            'message' => 'Espacio actualizado exitosamente',
            'data' => $space->fresh(),
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/spaces/{id}",
     *     summary="Eliminar espacio (Solo Admin)",
     *     tags={"Spaces"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del espacio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Espacio eliminado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Espacio eliminado exitosamente")
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Espacio no encontrado")
     * )
     */
    public function destroy(DeleteSpaceRequest $request, Space $space): JsonResponse
    {
        $space->delete();

        return response()->json([
            'message' => 'Espacio eliminado exitosamente',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/spaces/{id}/availability",
     *     summary="Verificar disponibilidad de un espacio",
     *     tags={"Spaces"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del espacio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="start_time",
     *         in="query",
     *         required=true,
     *         description="Fecha y hora de inicio (Y-m-d H:i:s)",
     *         @OA\Schema(type="string", format="datetime")
     *     ),
     *     @OA\Parameter(
     *         name="end_time",
     *         in="query",
     *         required=true,
     *         description="Fecha y hora de fin (Y-m-d H:i:s)",
     *         @OA\Schema(type="string", format="datetime")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Estado de disponibilidad",
     *         @OA\JsonContent(
     *             @OA\Property(property="available", type="boolean", example=true),
     *             @OA\Property(property="space_id", type="integer", example=1),
     *             @OA\Property(property="start_time", type="string", example="2025-01-15 09:00:00"),
     *             @OA\Property(property="end_time", type="string", example="2025-01-15 12:00:00")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Espacio no encontrado"),
     *     @OA\Response(response=422, description="Error de validación")
     * )
     */
    public function availability(Request $request, Space $space): JsonResponse
    {
        $validated = $request->validate([
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
        ]);

        $isAvailable = $space->isAvailable($validated['start_time'], $validated['end_time']);

        return response()->json([
            'available' => $isAvailable,
            'space_id' => $space->id,
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/spaces/{id}/reservations",
     *     summary="Obtener reservaciones de un espacio",
     *     tags={"Spaces"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID del espacio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="from_date",
     *         in="query",
     *         description="Fecha desde (Y-m-d)",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="to_date",
     *         in="query",
     *         description="Fecha hasta (Y-m-d)",
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de reservaciones del espacio",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Reservation")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=404, description="Espacio no encontrado")
     * )
     */
    public function reservations(Request $request, Space $space): JsonResponse
    {
        $query = $space->reservations()
            ->whereIn('status', ['confirmed', 'pending'])
            ->orderBy('start_time');

        // Filtrar por fecha desde
        if ($request->has('from_date')) {
            $query->whereDate('start_time', '>=', $request->from_date);
        }

        // Filtrar por fecha hasta
        if ($request->has('to_date')) {
            $query->whereDate('end_time', '<=', $request->to_date);
        }

        $reservations = $query->get();

        return response()->json([
            'data' => $reservations,
        ]);
    }
}
