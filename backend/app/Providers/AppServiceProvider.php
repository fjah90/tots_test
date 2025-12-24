<?php

namespace App\Providers;

use App\Contracts\AvailabilityServiceInterface;
use App\Services\AvailabilityService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * Aquí se registran los bindings de interfaces a implementaciones
     * siguiendo el principio de Inversión de Dependencias (DIP).
     */
    public function register(): void
    {
        // Binding: cuando se solicite la interfaz, Laravel inyecta la implementación
        $this->app->bind(
            AvailabilityServiceInterface::class,
            AvailabilityService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void {}
}
