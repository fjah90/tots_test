<?php

namespace App\OpenApi\Schemas;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Juan Pérez"),
 *     @OA\Property(property="email", type="string", format="email", example="juan@ejemplo.com"),
 *     @OA\Property(property="role", type="string", enum={"admin", "user"}, example="user"),
 *     @OA\Property(property="created_at", type="string", format="datetime", example="2025-01-01T00:00:00.000000Z"),
 *     @OA\Property(property="updated_at", type="string", format="datetime", example="2025-01-01T00:00:00.000000Z")
 * )
 *
 * @OA\Schema(
 *     schema="Space",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Sala de Conferencias Principal"),
 *     @OA\Property(property="description", type="string", example="Sala amplia con capacidad para 30 personas"),
 *     @OA\Property(property="capacity", type="integer", example=30),
 *     @OA\Property(property="location", type="string", example="Edificio A - Piso 2"),
 *     @OA\Property(
 *         property="amenities",
 *         type="array",
 *         @OA\Items(type="string"),
 *         example={"WiFi", "Proyector", "Pizarra", "Aire Acondicionado"}
 *     ),
 *     @OA\Property(property="image_url", type="string", nullable=true, example="https://example.com/sala.jpg"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="datetime"),
 *     @OA\Property(property="updated_at", type="string", format="datetime")
 * )
 *
 * @OA\Schema(
 *     schema="Reservation",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="user_id", type="integer", example=1),
 *     @OA\Property(property="space_id", type="integer", example=1),
 *     @OA\Property(property="start_time", type="string", format="datetime", example="2025-01-20 09:00:00"),
 *     @OA\Property(property="end_time", type="string", format="datetime", example="2025-01-20 12:00:00"),
 *     @OA\Property(property="status", type="string", enum={"confirmed", "cancelled", "pending"}, example="confirmed"),
 *     @OA\Property(property="notes", type="string", nullable=true, example="Reunión de equipo"),
 *     @OA\Property(property="created_at", type="string", format="datetime"),
 *     @OA\Property(property="updated_at", type="string", format="datetime"),
 *     @OA\Property(property="user", ref="#/components/schemas/User"),
 *     @OA\Property(property="space", ref="#/components/schemas/Space")
 * )
 *
 * @OA\Schema(
 *     schema="LoginRequest",
 *     type="object",
 *     required={"email", "password"},
 *     @OA\Property(property="email", type="string", format="email", example="admin@espacios.com"),
 *     @OA\Property(property="password", type="string", format="password", example="password123")
 * )
 *
 * @OA\Schema(
 *     schema="RegisterRequest",
 *     type="object",
 *     required={"name", "email", "password", "password_confirmation"},
 *     @OA\Property(property="name", type="string", example="Nuevo Usuario"),
 *     @OA\Property(property="email", type="string", format="email", example="nuevo@ejemplo.com"),
 *     @OA\Property(property="password", type="string", format="password", minLength=8, example="password123"),
 *     @OA\Property(property="password_confirmation", type="string", example="password123")
 * )
 *
 * @OA\Schema(
 *     schema="AuthResponse",
 *     type="object",
 *     @OA\Property(property="user", ref="#/components/schemas/User"),
 *     @OA\Property(property="token", type="string", example="1|abcdefghijklmnopqrstuvwxyz123456")
 * )
 *
 * @OA\Schema(
 *     schema="ErrorResponse",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Error message"),
 *     @OA\Property(property="errors", type="object", nullable=true)
 * )
 */
class Schemas
{
    // Esta clase solo contiene anotaciones OpenAPI para schemas compartidos
}
