import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold">Estadísticas</h1>
      <p class="text-gray-600">TODO: Implementar dashboard de estadísticas</p>
    </div>
  `
})
export class AdminStatsComponent {}
