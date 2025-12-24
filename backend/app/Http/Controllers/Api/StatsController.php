<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;

class StatsController extends Controller
{
    /**
     * Admin Stats - Estadísticas para el panel de administración
     * GET /api/admin/stats
     */
    public function adminStats(Request $request): JsonResponse
    {
        // Totales
        $totalSpaces = Space::count();
        $totalReservations = Reservation::count();
        $totalUsers = User::count();

        // Reservaciones por estado
        $reservationsByStatus = [
            'pending' => Reservation::where('status', 'pending')->count(),
            'confirmed' => Reservation::where('status', 'confirmed')->count(),
            'cancelled' => Reservation::where('status', 'cancelled')->count(),
        ];

        // Top 5 espacios más reservados
        $topSpaces = Space::withCount(['reservations' => function ($query) {
            $query->where('status', '!=', 'cancelled');
        }])
            ->orderByDesc('reservations_count')
            ->take(5)
            ->get(['id', 'name', 'reservations_count']);

        // Reservaciones por mes (últimos 6 meses)
        $reservationsByMonth = Reservation::select(
            DB::raw("strftime('%Y-%m', created_at) as month"),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'count' => $item->count,
                ];
            });

        return response()->json([
            'data' => [
                'total_spaces' => $totalSpaces,
                'total_reservations' => $totalReservations,
                'total_users' => $totalUsers,
                'reservations_by_status' => $reservationsByStatus,
                'top_spaces' => $topSpaces,
                'reservations_by_month' => $reservationsByMonth,
            ]
        ]);
    }

    /**
     * @OA\Get(
     *     path="/stats/dashboard",
     *     summary="Obtener estadísticas del dashboard (Solo Admin)",
     *     description="Funcionalidad adicional: Proporciona métricas clave del sistema para el panel de administración",
     *     tags={"Stats"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas del sistema",
     *         @OA\JsonContent(
     *             @OA\Property(property="summary", type="object",
     *                 @OA\Property(property="total_users", type="integer", example=50),
     *                 @OA\Property(property="total_spaces", type="integer", example=10),
     *                 @OA\Property(property="total_reservations", type="integer", example=150),
     *                 @OA\Property(property="active_spaces", type="integer", example=8),
     *                 @OA\Property(property="confirmed_reservations", type="integer", example=120),
     *                 @OA\Property(property="cancelled_reservations", type="integer", example=20)
     *             ),
     *             @OA\Property(property="top_spaces", type="array",
     *                 @OA\Items(type="object",
     *                     @OA\Property(property="id", type="integer"),
     *                     @OA\Property(property="name", type="string"),
     *                     @OA\Property(property="reservations_count", type="integer")
     *                 )
     *             ),
     *             @OA\Property(property="recent_reservations", type="array",
     *                 @OA\Items(ref="#/components/schemas/Reservation")
     *             ),
     *             @OA\Property(property="reservations_by_status", type="object",
     *                 @OA\Property(property="confirmed", type="integer"),
     *                 @OA\Property(property="pending", type="integer"),
     *                 @OA\Property(property="cancelled", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado (solo admin)")
     * )
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Solo los administradores pueden acceder a las estadísticas',
            ], 403);
        }

        // Resumen general
        $summary = [
            'total_users' => User::count(),
            'total_spaces' => Space::count(),
            'total_reservations' => Reservation::count(),
            'active_spaces' => Space::where('is_active', true)->count(),
            'confirmed_reservations' => Reservation::where('status', 'confirmed')->count(),
            'cancelled_reservations' => Reservation::where('status', 'cancelled')->count(),
        ];

        // Top 5 espacios más reservados
        $topSpaces = Space::withCount(['reservations' => function ($query) {
            $query->where('status', 'confirmed');
        }])
            ->orderByDesc('reservations_count')
            ->take(5)
            ->get(['id', 'name']);

        // Últimas 10 reservaciones
        $recentReservations = Reservation::with(['user:id,name,email', 'space:id,name'])
            ->orderByDesc('created_at')
            ->take(10)
            ->get();

        // Reservaciones por estado
        $reservationsByStatus = Reservation::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Reservaciones por mes (últimos 6 meses)
        $reservationsByMonth = Reservation::select(
            DB::raw("strftime('%Y-%m', created_at) as month"),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return response()->json([
            'summary' => $summary,
            'top_spaces' => $topSpaces,
            'recent_reservations' => $recentReservations,
            'reservations_by_status' => $reservationsByStatus,
            'reservations_by_month' => $reservationsByMonth,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/stats/space/{id}",
     *     summary="Obtener estadísticas de un espacio específico (Solo Admin)",
     *     description="Funcionalidad adicional: Métricas detalladas de uso de un espacio",
     *     tags={"Stats"},
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
     *         description="Estadísticas del espacio",
     *         @OA\JsonContent(
     *             @OA\Property(property="space", ref="#/components/schemas/Space"),
     *             @OA\Property(property="stats", type="object",
     *                 @OA\Property(property="total_reservations", type="integer"),
     *                 @OA\Property(property="confirmed_reservations", type="integer"),
     *                 @OA\Property(property="cancelled_reservations", type="integer"),
     *                 @OA\Property(property="occupancy_rate", type="number", format="float"),
     *                 @OA\Property(property="unique_users", type="integer")
     *             ),
     *             @OA\Property(property="upcoming_reservations", type="array",
     *                 @OA\Items(ref="#/components/schemas/Reservation")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado"),
     *     @OA\Response(response=403, description="No autorizado"),
     *     @OA\Response(response=404, description="Espacio no encontrado")
     * )
     */
    public function spaceStats(Request $request, Space $space): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'message' => 'Solo los administradores pueden acceder a las estadísticas',
            ], 403);
        }

        $totalReservations = $space->reservations()->count();
        $confirmedReservations = $space->reservations()->where('status', 'confirmed')->count();
        $cancelledReservations = $space->reservations()->where('status', 'cancelled')->count();
        $uniqueUsers = $space->reservations()->distinct('user_id')->count('user_id');

        // Tasa de ocupación (reservaciones confirmadas / total)
        $occupancyRate = $totalReservations > 0 
            ? round(($confirmedReservations / $totalReservations) * 100, 2) 
            : 0;

        // Próximas reservaciones
        $upcomingReservations = $space->reservations()
            ->with(['user:id,name,email'])
            ->where('start_time', '>=', now())
            ->where('status', 'confirmed')
            ->orderBy('start_time')
            ->take(10)
            ->get();

        return response()->json([
            'space' => $space,
            'stats' => [
                'total_reservations' => $totalReservations,
                'confirmed_reservations' => $confirmedReservations,
                'cancelled_reservations' => $cancelledReservations,
                'occupancy_rate' => $occupancyRate,
                'unique_users' => $uniqueUsers,
            ],
            'upcoming_reservations' => $upcomingReservations,
        ]);
    }
}
