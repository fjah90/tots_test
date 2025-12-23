import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
  selector: 'app-register',
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
    DividerModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4">
      <p-card styleClass="w-full max-w-md shadow-2xl">
        <ng-template #header>
          <div class="text-center pt-6">
            <i class="pi pi-user-plus text-5xl text-green-500 mb-4"></i>
            <h1 class="text-2xl font-bold text-gray-800">Crear Cuenta</h1>
            <p class="text-gray-600">Regístrate para reservar espacios</p>
          </div>
        </ng-template>

        @if (errorMessage()) {
          <p-message severity="error" [text]="errorMessage()!" styleClass="w-full mb-4" />
        }

        @if (successMessage()) {
          <p-message severity="success" [text]="successMessage()!" styleClass="w-full mb-4" />
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Nombre -->
          <div class="flex flex-col gap-2">
            <label for="name" class="font-medium text-gray-700">Nombre Completo</label>
            <input 
              id="name"
              type="text" 
              pInputText 
              formControlName="name"
              placeholder="Juan Pérez"
              class="w-full"
            />
            @if (nameControl?.invalid && nameControl?.touched) {
              <small class="text-red-500">El nombre es requerido (mínimo 2 caracteres)</small>
            }
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-2">
            <label for="email" class="font-medium text-gray-700">Correo Electrónico</label>
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
            <label for="password" class="font-medium text-gray-700">Contraseña</label>
            <p-password 
              id="password"
              formControlName="password"
              [feedback]="true"
              [toggleMask]="true"
              placeholder="Mínimo 8 caracteres"
              styleClass="w-full"
              inputStyleClass="w-full"
              promptLabel="Ingresa una contraseña"
              weakLabel="Débil"
              mediumLabel="Media"
              strongLabel="Fuerte"
            />
            @if (passwordControl?.invalid && passwordControl?.touched) {
              <small class="text-red-500">La contraseña debe tener mínimo 8 caracteres</small>
            }
          </div>

          <!-- Confirm Password -->
          <div class="flex flex-col gap-2">
            <label for="password_confirmation" class="font-medium text-gray-700">Confirmar Contraseña</label>
            <p-password 
              id="password_confirmation"
              formControlName="password_confirmation"
              [feedback]="false"
              [toggleMask]="true"
              placeholder="Repite tu contraseña"
              styleClass="w-full"
              inputStyleClass="w-full"
            />
            @if (confirmPasswordControl?.invalid && confirmPasswordControl?.touched) {
              <small class="text-red-500">
                @if (confirmPasswordControl?.errors?.['required']) {
                  Confirma tu contraseña
                } @else if (confirmPasswordControl?.errors?.['passwordMismatch']) {
                  Las contraseñas no coinciden
                }
              </small>
            }
          </div>

          <!-- Submit Button -->
          <p-button 
            type="submit"
            label="Crear Cuenta" 
            icon="pi pi-user-plus"
            styleClass="w-full"
            [loading]="loading()"
            [disabled]="registerForm.invalid || loading()"
          />
        </form>

        <p-divider align="center">
          <span class="text-gray-500 text-sm">¿Ya tienes cuenta?</span>
        </p-divider>

        <p-button 
          label="Iniciar Sesión" 
          icon="pi pi-sign-in"
          severity="secondary"
          [outlined]="true"
          styleClass="w-full"
          routerLink="/auth/login"
        />
      </p-card>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  get nameControl() { return this.registerForm.get('name'); }
  get emailControl() { return this.registerForm.get('email'); }
  get passwordControl() { return this.registerForm.get('password'); }
  get confirmPasswordControl() { return this.registerForm.get('password_confirmation'); }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      password_confirmation: this.registerForm.value.password_confirmation
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('¡Cuenta creada exitosamente! Redirigiendo...');
        setTimeout(() => {
          this.router.navigate(['/spaces']);
        }, 1500);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 422) {
          const errors = err.error?.errors;
          if (errors?.email) {
            this.errorMessage.set('Este correo ya está registrado.');
          } else {
            this.errorMessage.set('Por favor verifica los datos ingresados.');
          }
        } else {
          this.errorMessage.set('Error al crear la cuenta. Intenta nuevamente.');
        }
      }
    });
  }
}
