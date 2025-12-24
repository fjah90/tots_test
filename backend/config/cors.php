<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración de CORS para la API. En producción, debes especificar
    | los dominios permitidos en lugar de usar '*'.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE PARA PRODUCCIÓN:
    | Cambiar '*' por los dominios específicos de tu frontend, ejemplo:
    | 'allowed_origins' => ['https://tudominio.com', 'https://www.tudominio.com'],
    |
    */
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 horas de caché para preflight requests

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    |
    | Cuando uses cookies de autenticación (Sanctum SPA), esto debe ser true.
    | Si usas solo tokens Bearer, puede ser false.
    |
    */
    'supports_credentials' => true,

];
