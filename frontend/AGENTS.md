# AGENTS.md - Frontend

## Project Overview
Frontend Angular 21 para Sistema de Reserva de Espacios "SpaceBook".
Stack: Angular 21 + PrimeNG 21 + TailwindCSS + FullCalendar + MC-Table (@mckit)

## Setup Commands
```bash
pnpm install          # Instalar dependencias
pnpm start            # Iniciar servidor dev (localhost:4200)
pnpm build            # Build de producción
pnpm test             # Ejecutar tests (Vitest - 24 tests)
pnpm test:coverage    # Tests con cobertura
pnpm lint             # Linting
```

## Testing Instructions
- Framework: Vitest
- Total tests: 24
- Ejecutar antes de cada commit: `pnpm test -- --run`
- Agregar tests para código nuevo

## Technologies
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 21.0.6 | Framework principal |
| PrimeNG | 21.0.2 | Componentes UI |
| TailwindCSS | 3.4.19 | Estilos utilitarios |
| FullCalendar | 6.1.20 | Calendario interactivo |
| @mckit/table | 19.0.14 | Tabla admin |
| Vitest | Latest | Testing |

## Project Structure
```
src/app/
├── core/                    # Servicios singleton, guards, interceptors
│   ├── services/            # auth, spaces, reservations, theme
│   ├── guards/              # auth.guard, admin.guard
│   └── interceptors/        # auth.interceptor
├── shared/                  # Interfaces, pipes, componentes reutilizables
│   └── interfaces/          # Space, Reservation, User
├── features/                # Módulos por funcionalidad (lazy loaded)
│   ├── auth/                # Login, Register
│   ├── spaces/              # Lista, Detalle, Reservación
│   ├── reservations/        # Mis Reservaciones
│   ├── calendar/            # Calendario público
│   └── admin/               # Dashboard, Espacios, Reservaciones, Stats
└── app.routes.ts            # Rutas principales
```

## Key Features
- **Dark Mode**: Toggle Light/Dark/System con persistencia
- **Infinite Scroll**: Carga progresiva de espacios
- **FullCalendar**: Vista mes/semana/día con reservaciones
- **MC-Table**: Tabla avanzada para admin
- **Carousel**: Múltiples imágenes por espacio
- **Responsive**: Grid adaptativo 3/2/1 columnas

## Code Conventions
```typescript
// Standalone components con inject()
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
})
export class ExampleComponent {
  private service = inject(ExampleService);
  data = signal<Data[]>([]);
  loading = signal(false);
}
```

## Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Styling
- TailwindCSS para utilidades
- SCSS para estilos complejos
- Dark mode: clases `dark:*` de Tailwind
- PrimeNG dark mode: estilos globales en `styles.scss`
