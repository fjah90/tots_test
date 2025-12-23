import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';

// Services
import { SpacesService } from '../../../../core/services/spaces.service';
import { Space } from '../../../../shared/interfaces';

@Component({
  selector: 'app-space-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ToggleSwitchModule,
    CardModule,
    ToastModule,
    DividerModule,
    ProgressSpinnerModule,
    TagModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center gap-4 mb-4">
            <p-button 
              icon="pi pi-arrow-left" 
              severity="secondary"
              [rounded]="true"
              [text]="true"
              routerLink="/admin/spaces"
            />
            <div>
              <h1 class="text-3xl font-bold">
                {{ isEditMode() ? 'Editar Espacio' : 'Nuevo Espacio' }}
              </h1>
              <p class="text-blue-100">
                {{ isEditMode() ? 'Modifica los datos del espacio' : 'Completa los datos para crear un nuevo espacio' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-8 -mt-6">
        @if (loadingSpace()) {
          <div class="flex justify-center items-center py-20 bg-white rounded-lg shadow">
            <p-progressSpinner strokeWidth="4" />
          </div>
        } @else {
          <form [formGroup]="spaceForm" (ngSubmit)="onSubmit()">
            <p-card>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nombre -->
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label for="name" class="font-semibold text-gray-700">
                    Nombre del Espacio <span class="text-red-500">*</span>
                  </label>
                  <input 
                    id="name"
                    type="text" 
                    pInputText 
                    formControlName="name"
                    placeholder="Ej: Sala de Conferencias A"
                    class="w-full"
                  />
                  @if (nameControl?.invalid && nameControl?.touched) {
                    <small class="text-red-500">El nombre es requerido</small>
                  }
                </div>

                <!-- Descripción -->
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label for="description" class="font-semibold text-gray-700">
                    Descripción
                  </label>
                  <textarea 
                    id="description"
                    pTextarea
                    formControlName="description"
                    placeholder="Describe el espacio, características especiales, etc."
                    [rows]="4"
                    class="w-full">
                  </textarea>
                </div>

                <!-- Capacidad -->
                <div class="flex flex-col gap-2">
                  <label for="capacity" class="font-semibold text-gray-700">
                    Capacidad <span class="text-red-500">*</span>
                  </label>
                  <p-inputNumber 
                    id="capacity"
                    formControlName="capacity"
                    [min]="1"
                    [max]="1000"
                    placeholder="Número de personas"
                    styleClass="w-full"
                    [showButtons]="true"
                  />
                  @if (capacityControl?.invalid && capacityControl?.touched) {
                    <small class="text-red-500">La capacidad es requerida (mínimo 1)</small>
                  }
                </div>

                <!-- Ubicación -->
                <div class="flex flex-col gap-2">
                  <label for="location" class="font-semibold text-gray-700">
                    Ubicación
                  </label>
                  <input 
                    id="location"
                    type="text" 
                    pInputText 
                    formControlName="location"
                    placeholder="Ej: Edificio Central, Piso 3"
                    class="w-full"
                  />
                </div>

                <!-- URL de Imagen -->
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label for="image_url" class="font-semibold text-gray-700">
                    URL de Imagen
                  </label>
                  <input 
                    id="image_url"
                    type="url" 
                    pInputText 
                    formControlName="image_url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    class="w-full"
                  />
                  @if (imageUrlControl?.value) {
                    <div class="mt-2">
                      <img 
                        [src]="imageUrlControl?.value" 
                        alt="Preview"
                        class="w-48 h-32 object-cover rounded-lg border"
                        (error)="onImageError($event)"
                      />
                    </div>
                  }
                </div>

                <!-- Amenidades -->
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label for="amenities" class="font-semibold text-gray-700">
                    Amenidades
                  </label>
                  <div class="flex gap-2">
                    <input 
                      id="amenities"
                      type="text" 
                      pInputText 
                      [(ngModel)]="newAmenity"
                      [ngModelOptions]="{standalone: true}"
                      placeholder="Escribe una amenidad"
                      class="flex-1"
                      (keydown.enter)="addAmenity($event)"
                    />
                    <p-button 
                      icon="pi pi-plus" 
                      (onClick)="addAmenity($event)"
                      [disabled]="!newAmenity.trim()"
                    />
                  </div>
                  @if (amenitiesArray.length > 0) {
                    <div class="flex flex-wrap gap-2 mt-2">
                      @for (amenity of amenitiesArray; track amenity; let i = $index) {
                        <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {{ amenity }}
                          <button 
                            type="button"
                            class="ml-1 hover:text-red-600 transition-colors"
                            (click)="removeAmenity(i)">
                            <i class="pi pi-times text-xs"></i>
                          </button>
                        </span>
                      }
                    </div>
                  }
                  <small class="text-gray-500">
                    Ejemplos: WiFi, Proyector, Pizarra, Aire Acondicionado
                  </small>
                </div>

                <p-divider styleClass="md:col-span-2" />

                <!-- Estado Activo -->
                <div class="md:col-span-2 flex items-center gap-4">
                  <p-toggleSwitch 
                    formControlName="is_active"
                    inputId="is_active"
                  />
                  <label for="is_active" class="font-semibold text-gray-700 cursor-pointer">
                    Espacio Activo
                  </label>
                  <span class="text-gray-500 text-sm">
                    (Los espacios inactivos no aparecen en las búsquedas)
                  </span>
                </div>
              </div>

              <!-- Botones -->
              <ng-template #footer>
                <div class="flex justify-end gap-4 pt-4">
                  <p-button 
                    label="Cancelar" 
                    severity="secondary"
                    [outlined]="true"
                    routerLink="/admin/spaces"
                  />
                  <p-button 
                    [label]="isEditMode() ? 'Guardar Cambios' : 'Crear Espacio'"
                    icon="pi pi-check"
                    type="submit"
                    [loading]="submitting()"
                    [disabled]="spaceForm.invalid || submitting()"
                  />
                </div>
              </ng-template>
            </p-card>
          </form>
        }
      </div>
    </div>
  `
})
export class SpaceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spacesService = inject(SpacesService);
  private messageService = inject(MessageService);

  spaceId = signal<number | null>(null);
  isEditMode = signal(false);
  loadingSpace = signal(false);
  submitting = signal(false);

  // Para manejo de amenidades
  newAmenity = '';
  amenitiesArray: string[] = [];

  spaceForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    capacity: [1, [Validators.required, Validators.min(1)]],
    location: [''],
    image_url: [''],
    amenities: [[]],
    is_active: [true]
  });

  get nameControl() { return this.spaceForm.get('name'); }
  get capacityControl() { return this.spaceForm.get('capacity'); }
  get imageUrlControl() { return this.spaceForm.get('image_url'); }

  addAmenity(event: Event): void {
    event.preventDefault();
    const value = this.newAmenity.trim();
    if (value && !this.amenitiesArray.includes(value)) {
      this.amenitiesArray.push(value);
      this.spaceForm.patchValue({ amenities: this.amenitiesArray });
    }
    this.newAmenity = '';
  }

  removeAmenity(index: number): void {
    this.amenitiesArray.splice(index, 1);
    this.spaceForm.patchValue({ amenities: this.amenitiesArray });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.spaceId.set(+id);
      this.isEditMode.set(true);
      this.loadSpace(+id);
    }
  }

  loadSpace(id: number): void {
    this.loadingSpace.set(true);
    this.spacesService.getSpace(id).subscribe({
      next: (space) => {
        this.amenitiesArray = space.amenities || [];
        this.spaceForm.patchValue({
          name: space.name,
          description: space.description || '',
          capacity: space.capacity,
          location: space.location || '',
          image_url: space.image_url || '',
          amenities: this.amenitiesArray,
          is_active: space.is_active
        });
        this.loadingSpace.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el espacio'
        });
        this.loadingSpace.set(false);
        this.router.navigate(['/admin/spaces']);
      }
    });
  }

  onSubmit(): void {
    if (this.spaceForm.invalid) {
      this.spaceForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formData = this.spaceForm.value;

    const operation = this.isEditMode()
      ? this.spacesService.updateSpace(this.spaceId()!, formData)
      : this.spacesService.createSpace(formData);

    operation.subscribe({
      next: (space) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.isEditMode() 
            ? 'Espacio actualizado correctamente' 
            : 'Espacio creado correctamente'
        });
        this.submitting.set(false);
        setTimeout(() => this.router.navigate(['/admin/spaces']), 1500);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo guardar el espacio'
        });
        this.submitting.set(false);
      }
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
