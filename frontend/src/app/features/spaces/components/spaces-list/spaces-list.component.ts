import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Espacios Disponibles</h1>
      <p class="text-gray-600">TODO: Implementar listado público de espacios</p>
    </div>
  `
})
export class SpacesListComponent {}
