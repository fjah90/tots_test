import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
    >
      <div class="text-center px-6">
        <!-- Ilustración 404 -->
        <div class="relative mb-8">
          <span
            class="text-[180px] md:text-[250px] font-black text-gray-200 select-none leading-none"
          >
            404
          </span>
          <div class="absolute inset-0 flex items-center justify-center">
            <i class="pi pi-map text-6xl md:text-8xl text-blue-500 animate-bounce"></i>
          </div>
        </div>

        <!-- Mensaje -->
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">¡Página no encontrada!</h1>
        <p class="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
        </p>

        <!-- Acciones -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <p-button label="Ir al Inicio" icon="pi pi-home" routerLink="/" size="large" />
          <p-button
            label="Ver Espacios"
            icon="pi pi-building"
            routerLink="/spaces"
            severity="secondary"
            [outlined]="true"
            size="large"
          />
        </div>

        <!-- Info adicional -->
        <p class="mt-12 text-gray-500 text-sm">
          ¿Necesitas ayuda? Contacta con el
          <a href="mailto:soporte@espacios.com" class="text-blue-500 hover:underline">
            soporte técnico
          </a>
        </p>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
