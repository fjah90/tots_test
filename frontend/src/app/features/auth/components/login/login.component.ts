import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

// Services
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
    DividerModule,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 dark:from-gray-800 dark:to-gray-900 p-4 transition-colors"
    >
      <p-card styleClass="w-full max-w-md shadow-2xl">
        <ng-template #header>
          <div class="text-center pt-6">
            <img src="logo.svg" alt="SpaceBook" class="h-12 mx-auto mb-4" />
            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Bienvenido</h1>
            <p class="text-gray-600 dark:text-gray-400">Inicia sesión en tu cuenta</p>
          </div>
        </ng-template>

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage()!" styleClass="w-full mb-4" />
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Email -->
          <div class="flex flex-col gap-2">
            <label for="email" class="font-medium text-gray-700 dark:text-gray-300"
              >Correo Electrónico</label
            >
            <input
              id="email"
              type="email"
              pInputText
              formControlName="email"
              placeholder="correo@ejemplo.com"
              class="w-full"
            />
            @if (emailControl?.invalid && emailControl?.touched) {
              <small class="text-red-500">
                @if (emailControl?.errors?.['required']) {
                  El correo es requerido
                } @else if (emailControl?.errors?.['email']) {
                  Ingresa un correo válido
                }
              </small>
            }
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-2">
            <label for="password" class="font-medium text-gray-700 dark:text-gray-300"
              >Contraseña</label
            >
            <p-password
              id="password"
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
              placeholder="••••••••"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
            @if (passwordControl?.invalid && passwordControl?.touched) {
              <small class="text-red-500">La contraseña es requerida</small>
            }
          </div>

          <!-- Submit Button -->
          <p-button
            type="submit"
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            styleClass="w-full"
            [loading]="loading()"
            [disabled]="loginForm.invalid || loading()"
          />
        </form>

        <p-divider align="center">
          <span class="text-gray-500 dark:text-gray-400 text-sm">¿No tienes cuenta?</span>
        </p-divider>

        <p-button
          label="Crear cuenta"
          icon="pi pi-user-plus"
          severity="secondary"
          [outlined]="true"
          styleClass="w-full"
          routerLink="/auth/register"
        />
      </p-card>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailControl() {
    return this.loginForm.get('email');
  }
  get passwordControl() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/spaces']);
      },
      error: err => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (err.status === 422) {
          this.errorMessage.set('Por favor verifica los datos ingresados.');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        }
      },
    });
  }
}
