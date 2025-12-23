import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Detalle del Espacio</h1>
      <p class="text-gray-600">TODO: Implementar detalle con disponibilidad</p>
    </div>
  `
})
export class SpaceDetailComponent {}
