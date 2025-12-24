import { Component, Input, Output, EventEmitter, inject, signal, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';

// Services & Interfaces
import { ReservationsService } from '../../../../core/services/reservations.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Space } from '../../../../shared/interfaces';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    MessageModule
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private reservationsService = inject(ReservationsService);
  private authService = inject(AuthService);

  // Inputs
  @Input({ required: true }) space!: Space;
  @Input() preselectedDate: Date | null = null;

  // Outputs
  @Output() success = new EventEmitter<void>();
  @Output() error = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  // Estado
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Configuración de fechas
  minDate = new Date();
  minTime = new Date();

  // Formulario reactivo
  reservationForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia preselectedDate y el formulario ya existe, actualizar la fecha
    if (changes['preselectedDate'] && this.reservationForm) {
      const newDate = changes['preselectedDate'].currentValue;
      if (newDate) {
        this.reservationForm.patchValue({ date: newDate });
      }
    }
  }

  private initForm(): void {
    const defaultDate = this.preselectedDate || new Date();
    
    // Hora por defecto: próxima hora completa
    const defaultStartTime = new Date();
    defaultStartTime.setHours(defaultStartTime.getHours() + 1, 0, 0, 0);
    
    const defaultEndTime = new Date(defaultStartTime);
    defaultEndTime.setHours(defaultEndTime.getHours() + 1);

    this.reservationForm = this.fb.group({
      date: [defaultDate, Validators.required],
      startTime: [defaultStartTime, Validators.required],
      endTime: [defaultEndTime, Validators.required],
      eventName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.errorMessage.set('Debes iniciar sesión para hacer una reservación');
      return;
    }

    const formValue = this.reservationForm.value;
    
    // Combinar fecha con horas
    const startDateTime = this.combineDateAndTime(formValue.date, formValue.startTime);
    const endDateTime = this.combineDateAndTime(formValue.date, formValue.endTime);

    // Validar que hora fin sea mayor a hora inicio
    if (endDateTime <= startDateTime) {
      this.errorMessage.set('La hora de fin debe ser mayor a la hora de inicio');
      return;
    }

    // Preparar payload
    const payload = {
      space_id: this.space.id,
      start_time: this.formatDateTime(startDateTime),
      end_time: this.formatDateTime(endDateTime),
      notes: formValue.eventName + (formValue.notes ? ` - ${formValue.notes}` : '')
    };

    this.loading.set(true);
    this.errorMessage.set(null);

    this.reservationsService.createReservation(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.handleError(err);
      }
    });
  }

  private handleError(err: any): void {
    // Error 409: Conflicto (espacio ocupado)
    if (err.status === 409) {
      this.errorMessage.set('El espacio ya está ocupado en ese horario');
    } else if (err.status === 422) {
      this.errorMessage.set(err.error?.message || 'Datos de reservación inválidos');
    } else if (err.status === 401) {
      this.errorMessage.set('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    } else {
      this.errorMessage.set('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    }
    
    // Emitir error al componente padre para manejo adicional
    this.error.emit(err);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private combineDateAndTime(date: Date, time: Date): Date {
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  }

  private formatDateTime(date: Date): string {
    // Formato: YYYY-MM-DD HH:mm:ss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = '00';
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // Getters para validación en template
  get dateControl() { return this.reservationForm.get('date'); }
  get startTimeControl() { return this.reservationForm.get('startTime'); }
  get endTimeControl() { return this.reservationForm.get('endTime'); }
  get eventNameControl() { return this.reservationForm.get('eventName'); }
}
