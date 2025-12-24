<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Space Reservation API",
 *     version="1.0.0",
 *     description="API REST para sistema de reserva de espacios para eventos. Permite a los usuarios explorar espacios disponibles, hacer reservas y gestionarlas.",
 *
 *     @OA\Contact(
 *         email="admin@espacios.com",
 *         name="Soporte API"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Servidor de desarrollo"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Ingrese el token de autenticación"
 * )
 *
 * @OA\Tag(
 *     name="Auth",
 *     description="Endpoints de autenticación"
 * )
 * @OA\Tag(
 *     name="Spaces",
 *     description="CRUD de espacios"
 * )
 * @OA\Tag(
 *     name="Reservations",
 *     description="CRUD de reservas"
 * )
 */
abstract class Controller {}
