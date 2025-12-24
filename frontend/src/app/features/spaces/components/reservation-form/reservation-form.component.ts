import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

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
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    MessageModule,
    CheckboxModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss',
})
export class ReservationFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private reservationsService = inject(ReservationsService);
  private authService = inject(AuthService);

  // Inputs
  @Input({ required: true }) space!: Space;
  @Input() preselectedDate: Date | null = null;

  // Outputs
  @Output() reservationSuccess = new EventEmitter<void>();
  @Output() reservationError = new EventEmitter<any>();
  @Output() reservationCancel = new EventEmitter<void>();

  // Estado
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  failedDates = signal<{ date: string; reason: string }[]>([]);

  // Modo múltiples fechas
  multiDateMode = signal(false);

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
      dates: [[] as Date[]], // Para múltiples fechas
      startTime: [defaultStartTime, Validators.required],
      endTime: [defaultEndTime, Validators.required],
      eventName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      notes: [''],
    });
  }

  toggleMultiDateMode(): void {
    this.multiDateMode.update(v => !v);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.failedDates.set([]);

    if (this.multiDateMode()) {
      // Inicializar con la fecha actual seleccionada
      const currentDate = this.reservationForm.get('date')?.value;
      if (currentDate) {
        this.reservationForm.patchValue({ dates: [currentDate] });
      }
    }
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

    // Validar que hora fin sea mayor a hora inicio
    const startTime = formValue.startTime as Date;
    const endTime = formValue.endTime as Date;
    if (
      endTime.getHours() * 60 + endTime.getMinutes() <=
      startTime.getHours() * 60 + startTime.getMinutes()
    ) {
      this.errorMessage.set('La hora de fin debe ser mayor a la hora de inicio');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.failedDates.set([]);

    if (this.multiDateMode()) {
      this.submitBulkReservation(formValue);
    } else {
      this.submitSingleReservation(formValue);
    }
  }

  private submitSingleReservation(formValue: any): void {
    // Combinar fecha con horas
    const startDateTime = this.combineDateAndTime(formValue.date, formValue.startTime);
    const endDateTime = this.combineDateAndTime(formValue.date, formValue.endTime);

    // Preparar payload
    const payload = {
      space_id: this.space.id,
      start_time: this.formatDateTime(startDateTime),
      end_time: this.formatDateTime(endDateTime),
      notes: formValue.eventName + (formValue.notes ? ` - ${formValue.notes}` : ''),
    };

    this.reservationsService.createReservation(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.reservationSuccess.emit();
      },
      error: err => {
        this.loading.set(false);
        this.handleError(err);
      },
    });
  }

  private submitBulkReservation(formValue: any): void {
    const dates: Date[] = formValue.dates || [];

    if (dates.length === 0) {
      this.errorMessage.set('Selecciona al menos una fecha');
      this.loading.set(false);
      return;
    }

    const payload = {
      space_id: this.space.id,
      dates: dates.map(d => this.formatDate(d)),
      start_time: this.formatTime(formValue.startTime),
      end_time: this.formatTime(formValue.endTime),
      notes: formValue.eventName + (formValue.notes ? ` - ${formValue.notes}` : ''),
    };

    this.reservationsService.createBulkReservations(payload).subscribe({
      next: response => {
        this.loading.set(false);

        if (response.data.failed.length > 0) {
          this.failedDates.set(response.data.failed);
        }

        if (response.data.created.length > 0) {
          this.successMessage.set(response.message);
          // Si todas fueron exitosas, cerrar el modal
          if (response.data.failed.length === 0) {
            setTimeout(() => this.reservationSuccess.emit(), 1500);
          }
        }
      },
      error: err => {
        this.loading.set(false);
        if (err.status === 409) {
          this.errorMessage.set(
            err.error?.message || 'Todas las fechas seleccionadas están ocupadas'
          );
          if (err.error?.data?.failed) {
            this.failedDates.set(err.error.data.failed);
          }
        } else {
          this.handleError(err);
        }
      },
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
    this.reservationError.emit(err);
  }

  onCancel(): void {
    this.reservationCancel.emit();
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

  private formatDate(date: Date): string {
    // Formato: YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTime(time: Date): string {
    // Formato: HH:mm
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Getters para validación en template
  get dateControl() {
    return this.reservationForm.get('date');
  }
  get datesControl() {
    return this.reservationForm.get('dates');
  }
  get startTimeControl() {
    return this.reservationForm.get('startTime');
  }
  get endTimeControl() {
    return this.reservationForm.get('endTime');
  }
  get eventNameControl() {
    return this.reservationForm.get('eventName');
  }
}
