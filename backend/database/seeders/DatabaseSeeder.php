<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Space;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crear Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@espacios.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Crear Usuario normal
        User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@ejemplo.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        // Imágenes de Unsplash para espacios
        $images = [
            'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800',
            'https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800',
            'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
            'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
            'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
            'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
            'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
            'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
            'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?w=800',
            'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800',
            'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=800',
            'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
            'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
            'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
            'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800',
            'https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=800',
        ];

        // Tipos de espacios
        $spaceTypes = [
            ['prefix' => 'Sala de Conferencias', 'capacity_min' => 20, 'capacity_max' => 50],
            ['prefix' => 'Sala de Reuniones', 'capacity_min' => 6, 'capacity_max' => 15],
            ['prefix' => 'Auditorio', 'capacity_min' => 80, 'capacity_max' => 200],
            ['prefix' => 'Espacio de Coworking', 'capacity_min' => 20, 'capacity_max' => 60],
            ['prefix' => 'Sala de Capacitación', 'capacity_min' => 15, 'capacity_max' => 30],
            ['prefix' => 'Oficina Privada', 'capacity_min' => 2, 'capacity_max' => 8],
            ['prefix' => 'Sala de Brainstorming', 'capacity_min' => 8, 'capacity_max' => 15],
            ['prefix' => 'Estudio de Grabación', 'capacity_min' => 4, 'capacity_max' => 10],
            ['prefix' => 'Sala de Juntas', 'capacity_min' => 10, 'capacity_max' => 20],
            ['prefix' => 'Laboratorio Digital', 'capacity_min' => 12, 'capacity_max' => 25],
        ];

        // Edificios y pisos
        $buildings = ['Edificio A', 'Edificio B', 'Edificio C', 'Torre Norte', 'Torre Sur', 'Anexo Principal'];
        $floors = ['Planta Baja', 'Piso 1', 'Piso 2', 'Piso 3', 'Piso 4', 'Piso 5', 'Piso 6', 'Piso 7'];

        // Amenities pool
        $amenitiesPool = [
            'WiFi', 'WiFi de alta velocidad', 'Proyector 4K', 'Proyector HD', 'TV 55"', 'TV 65"', 'TV 75"',
            'Videoconferencia', 'Pizarra Digital', 'Pizarra Blanca', 'Aire Acondicionado', 'Calefacción',
            'Catering disponible', 'Café Premium', 'Minibar', 'Sonido Profesional', 'Micrófonos inalámbricos',
            'Grabación de eventos', 'Accesibilidad', 'Estacionamiento', 'Casilleros', 'Impresora',
            'Escáner', 'Teléfono de conferencia', 'Iluminación regulable', 'Cortinas blackout',
            'Vista panorámica', 'Terraza', 'Cocina equipada', 'Zona de descanso'
        ];

        // Descripciones base
        $descriptions = [
            'Espacio moderno y funcional, ideal para reuniones de trabajo y presentaciones.',
            'Ambiente profesional con todas las comodidades necesarias para sesiones productivas.',
            'Sala versátil con equipamiento de última generación y excelente iluminación natural.',
            'Diseñado para fomentar la creatividad y la colaboración entre equipos.',
            'Espacio silencioso y privado, perfecto para reuniones confidenciales.',
            'Área amplia con distribución flexible adaptable a diferentes necesidades.',
            'Entorno inspirador con vista a la ciudad y mobiliario ergonómico.',
            'Sala equipada con tecnología avanzada para eventos híbridos.',
            'Espacio climatizado con control individual de temperatura.',
            'Ambiente acogedor con decoración contemporánea y detalles premium.',
        ];

        // Generar 100 espacios
        for ($i = 1; $i <= 100; $i++) {
            $type = $spaceTypes[array_rand($spaceTypes)];
            $building = $buildings[array_rand($buildings)];
            $floor = $floors[array_rand($floors)];
            
            // Generar nombre único
            $suffix = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Omega', 'Prime', 'Plus', 'Pro', 'Elite'];
            $name = $type['prefix'] . ' ' . $suffix[array_rand($suffix)] . ' ' . $i;
            
            // Capacidad aleatoria dentro del rango
            $capacity = rand($type['capacity_min'], $type['capacity_max']);
            
            // Seleccionar amenities aleatorios (3-7)
            $numAmenities = rand(3, 7);
            $shuffledAmenities = $amenitiesPool;
            shuffle($shuffledAmenities);
            $amenities = array_slice($shuffledAmenities, 0, $numAmenities);
            
            // Seleccionar imagen principal
            $mainImage = $images[array_rand($images)];
            
            // Decidir si tiene múltiples imágenes (70% de probabilidad)
            $hasMultipleImages = rand(1, 100) <= 70;
            $spaceImages = null;
            if ($hasMultipleImages) {
                $numImages = rand(2, 4);
                $shuffledImages = $images;
                shuffle($shuffledImages);
                $spaceImages = array_slice($shuffledImages, 0, $numImages);
            }
            
            // Descripción aleatoria
            $description = $descriptions[array_rand($descriptions)];
            
            // 95% activos, 5% inactivos
            $isActive = rand(1, 100) <= 95;

            Space::create([
                'name' => $name,
                'description' => $description,
                'capacity' => $capacity,
                'location' => $building . ' - ' . $floor,
                'amenities' => $amenities,
                'image_url' => $mainImage,
                'images' => $spaceImages,
                'is_active' => $isActive,
            ]);
        }

        $this->command->info('✅ Seeder ejecutado correctamente:');
        $this->command->info('   - 1 Admin creado (admin@espacios.com)');
        $this->command->info('   - 1 Usuario creado (juan@ejemplo.com)');
        $this->command->info('   - 100 Espacios creados');
        $this->command->info('   - Password para ambos: password123');

        // Ejecutar seeder de reservaciones
        $this->call(ReservationSeeder::class);
    }
}
