<?php

namespace Database\Factories;

use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Space>
 */
class SpaceFactory extends Factory
{
    protected $model = Space::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amenities = ['WiFi', 'Proyector', 'Pizarra', 'Aire Acondicionado', 'Café', 'TV'];
        
        return [
            'name' => fake()->randomElement(['Sala', 'Auditorio', 'Espacio']) . ' ' . fake()->word(),
            'description' => fake()->paragraph(),
            'capacity' => fake()->numberBetween(5, 200),
            'location' => 'Edificio ' . fake()->randomLetter() . ' - Piso ' . fake()->numberBetween(1, 10),
            'amenities' => fake()->randomElements($amenities, fake()->numberBetween(2, 5)),
            'image_url' => fake()->optional()->imageUrl(640, 480, 'room'),
            'is_active' => fake()->boolean(90), // 90% activos
        ];
    }

    /**
     * Indicate that the space is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the space is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
