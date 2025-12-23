<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'capacity',
        'location',
        'amenities',
        'image_url',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'is_active' => 'boolean',
            'capacity' => 'integer',
        ];
    }

    /**
     * Get the reservations for the space.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Scope a query to only include active spaces.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Check if space is available for a given time range.
     */
    public function isAvailable(string $startTime, string $endTime, ?int $excludeReservationId = null): bool
    {
        $query = $this->reservations()
            ->where('status', 'confirmed')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($inner) use ($startTime, $endTime) {
                    $inner->where('start_time', '<', $endTime)
                          ->where('end_time', '>', $startTime);
                });
            });

        if ($excludeReservationId) {
            $query->where('id', '!=', $excludeReservationId);
        }

        return $query->doesntExist();
    }
}
