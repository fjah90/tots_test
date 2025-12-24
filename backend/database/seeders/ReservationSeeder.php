<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\Space;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    /**
     * Seed reservations with different statuses.
     *
     * Genera reservaciones variadas:
     * - 40% confirmed
     * - 35% pending
     * - 25% cancelled
     *
     * Distribuidas en pasado, presente y futuro.
     */
    public function run(): void
    {
        $users = User::all();
        $spaces = Space::where('is_active', true)->get();

        if ($users->isEmpty() || $spaces->isEmpty()) {
            $this->command->warn('⚠️ No hay usuarios o espacios. Ejecuta primero el DatabaseSeeder.');

            return;
        }

        $statuses = ['confirmed', 'pending', 'cancelled'];
        $eventNames = [
            'Reunión de equipo',
            'Presentación de proyecto',
            'Capacitación técnica',
            'Workshop de innovación',
            'Sesión de brainstorming',
            'Entrevista de trabajo',
            'Revisión trimestral',
            'Planificación estratégica',
            'Demo de producto',
            'Reunión con cliente',
            'Onboarding de empleados',
            'Retrospectiva de sprint',
            'Sesión de feedback',
            'Celebración de equipo',
            'Taller de diseño',
            'Hackathon interno',
            'Junta directiva',
            'Conferencia virtual',
            'Networking event',
            'Stand-up meeting',
        ];

        $reservationsCount = 0;
        $statusCounts = ['confirmed' => 0, 'pending' => 0, 'cancelled' => 0];

        // =====================================================================
        // CASO DE PRUEBA: Espacio completamente ocupado para probar filtro
        // =====================================================================
        $testSpace = Space::where('is_active', true)->first();
        $testDate = Carbon::now()->addDays(5)->startOfDay(); // 5 días en el futuro
        $testUser = $users->first();

        $this->command->info('');
        $this->command->info('📅 CASO DE PRUEBA - Espacio completamente ocupado:');
        $this->command->info("   Espacio: \"{$testSpace->name}\" (ID: {$testSpace->id})");
        $this->command->info("   Fecha: {$testDate->format('Y-m-d')} ({$testDate->format('l, d M Y')})");
        $this->command->info('   Horario: 08:00 - 20:00 (todo el día)');
        $this->command->info('');

        // Crear reservaciones que cubran todo el día (8:00-20:00) en bloques de 2 horas
        for ($hour = 8; $hour < 20; $hour += 2) {
            Reservation::create([
                'user_id' => $testUser->id,
                'space_id' => $testSpace->id,
                'start_time' => $testDate->copy()->setTime($hour, 0),
                'end_time' => $testDate->copy()->setTime($hour + 2, 0),
                'status' => 'confirmed',
                'notes' => "Bloque reservado {$hour}:00 - " . ($hour + 2) . ':00',
            ]);
            $reservationsCount++;
            $statusCounts['confirmed']++;
        }

        // Generar reservaciones para los próximos 30 días y los últimos 15 días
        for ($dayOffset = -15; $dayOffset <= 30; $dayOffset++) {
            $date = Carbon::now()->addDays($dayOffset)->startOfDay();

            // Saltar fines de semana (opcional - mantener algunos)
            if ($date->isWeekend() && rand(1, 100) > 30) {
                continue;
            }

            // 2-5 reservaciones por día
            $reservationsPerDay = rand(2, 5);

            for ($j = 0; $j < $reservationsPerDay; $j++) {
                $space = $spaces->random();
                $user = $users->random();

                // Hora de inicio entre 8:00 y 17:00
                $startHour = rand(8, 17);
                $startMinute = [0, 30][rand(0, 1)];

                // Duración entre 1 y 3 horas
                $durationHours = rand(1, 3);

                $startTime = $date->copy()->setTime($startHour, $startMinute);
                $endTime = $startTime->copy()->addHours($durationHours);

                // No pasar de las 20:00
                if ($endTime->hour > 20) {
                    $endTime->setTime(20, 0);
                }

                // Determinar estado basado en fecha y probabilidad
                if ($dayOffset < 0) {
                    // Reservaciones pasadas: más confirmadas
                    $status = $this->weightedRandom([
                        'confirmed' => 60,
                        'pending' => 10,
                        'cancelled' => 30,
                    ]);
                } elseif ($dayOffset <= 3) {
                    // Próximos 3 días: principalmente confirmadas
                    $status = $this->weightedRandom([
                        'confirmed' => 70,
                        'pending' => 20,
                        'cancelled' => 10,
                    ]);
                } else {
                    // Futuro lejano: más pendientes
                    $status = $this->weightedRandom([
                        'confirmed' => 30,
                        'pending' => 50,
                        'cancelled' => 20,
                    ]);
                }

                $eventName = $eventNames[array_rand($eventNames)];

                // Verificar que no haya solapamiento (simplificado)
                $exists = Reservation::where('space_id', $space->id)
                    ->where('status', '!=', 'cancelled')
                    ->where(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<', $endTime)
                            ->where('end_time', '>', $startTime);
                    })
                    ->exists();

                if (! $exists) {
                    Reservation::create([
                        'user_id' => $user->id,
                        'space_id' => $space->id,
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'status' => $status,
                        'notes' => $eventName,
                    ]);

                    $reservationsCount++;
                    $statusCounts[$status]++;
                }
            }
        }

        $this->command->info("✅ Reservaciones creadas: {$reservationsCount}");
        $this->command->info("   - Confirmadas: {$statusCounts['confirmed']}");
        $this->command->info("   - Pendientes: {$statusCounts['pending']}");
        $this->command->info("   - Canceladas: {$statusCounts['cancelled']}");
    }

    /**
     * Selección aleatoria ponderada.
     */
    private function weightedRandom(array $weights): string
    {
        $total = array_sum($weights);
        $random = rand(1, $total);

        foreach ($weights as $key => $weight) {
            $random -= $weight;
            if ($random <= 0) {
                return $key;
            }
        }

        return array_key_first($weights);
    }
}
