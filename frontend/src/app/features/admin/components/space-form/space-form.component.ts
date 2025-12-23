import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-space-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Formulario de Espacio</h1>
      <p class="text-gray-600">TODO: Implementar formulario de creación/edición</p>
    </div>
  `
})
export class SpaceFormComponent {}
