import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Registrarse</h1>
        <p class="text-gray-600 text-center">TODO: Implementar formulario de registro</p>
      </div>
    </div>
  `
})
export class RegisterComponent {}
