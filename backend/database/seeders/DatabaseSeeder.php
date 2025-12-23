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

        // Crear 5 Espacios realistas
        $spaces = [
            [
                'name' => 'Sala de Conferencias Principal',
                'description' => 'Amplia sala equipada con sistema de videoconferencia, proyector 4K y pizarra digital. Ideal para reuniones corporativas y presentaciones ejecutivas.',
                'capacity' => 30,
                'location' => 'Edificio A - Piso 3',
                'amenities' => ['WiFi', 'Proyector 4K', 'Videoconferencia', 'Pizarra Digital', 'Aire Acondicionado', 'Catering disponible'],
                'image_url' => 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800',
                'is_active' => true,
            ],
            [
                'name' => 'Sala de Reuniones Ejecutiva',
                'description' => 'Espacio exclusivo para reuniones de alto nivel con mobiliario premium y privacidad garantizada. Incluye servicio de café y snacks.',
                'capacity' => 10,
                'location' => 'Edificio A - Piso 5',
                'amenities' => ['WiFi', 'TV 65"', 'Minibar', 'Café Premium', 'Privacidad acústica'],
                'image_url' => 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                'is_active' => true,
            ],
            [
                'name' => 'Auditorio Central',
                'description' => 'Auditorio con capacidad para grandes eventos, conferencias y capacitaciones. Equipado con sistema de sonido profesional y escenario.',
                'capacity' => 150,
                'location' => 'Edificio B - Planta Baja',
                'amenities' => ['WiFi', 'Sonido Profesional', 'Escenario', 'Micrófonos inalámbricos', 'Grabación de eventos', 'Accesibilidad'],
                'image_url' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
                'is_active' => true,
            ],
            [
                'name' => 'Espacio de Coworking Creativo',
                'description' => 'Ambiente flexible y dinámico para trabajo colaborativo. Mesas modulares, áreas de descanso y máquina de café ilimitado.',
                'capacity' => 40,
                'location' => 'Edificio C - Piso 2',
                'amenities' => ['WiFi de alta velocidad', 'Mesas modulares', 'Zona de descanso', 'Café ilimitado', 'Impresora 3D', 'Casilleros'],
                'image_url' => 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800',
                'is_active' => true,
            ],
            [
                'name' => 'Sala de Capacitación Tech',
                'description' => 'Sala especializada para capacitaciones técnicas con 20 estaciones de trabajo equipadas con computadoras de última generación.',
                'capacity' => 20,
                'location' => 'Edificio C - Piso 4',
                'amenities' => ['WiFi', '20 PCs de última generación', 'Pizarra interactiva', 'Software especializado', 'Aire Acondicionado'],
                'image_url' => 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800',
                'is_active' => true,
            ],
        ];

        foreach ($spaces as $space) {
            Space::create($space);
        }

        $this->command->info('✅ Seeder ejecutado correctamente:');
        $this->command->info('   - 1 Admin creado (admin@espacios.com)');
        $this->command->info('   - 1 Usuario creado (juan@ejemplo.com)');
        $this->command->info('   - 5 Espacios creados');
        $this->command->info('   - Password para ambos: password123');
    }
}
