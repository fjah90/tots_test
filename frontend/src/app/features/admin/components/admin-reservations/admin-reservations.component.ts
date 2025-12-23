import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Administrar Reservaciones</h1>
      <p class="text-gray-600">TODO: Implementar listado de reservaciones</p>
    </div>
  `
})
export class AdminReservationsComponent {}
