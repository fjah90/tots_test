# AGENTS.md

## Project overview
Frontend Angular para Sistema de Reserva de Espacios.
Stack: Angular 21 + PrimeNG + TailwindCSS + MC-Table (@matiascamiletti/mc-kit)

## Setup commands
- Install deps: `pnpm install`
- Start dev server: `pnpm start` or `pnpm dev`
- Run tests: `pnpm test`
- Build production: `pnpm build`
- Lint: `pnpm lint`

## Testing instructions
- Run all tests: `pnpm test`
- Run with coverage: `pnpm test:coverage`
- Always run tests before committing
- Add or update tests for the code you change, even if nobody asked

## Code style
- Use standalone components (not NgModules)
- Use `inject()` instead of constructor injection
- Use signals for component state: `spaces = signal<Space[]>([])`
- Use `takeUntilDestroyed()` for subscriptions in components
- TypeScript strict mode enabled
- Single quotes, no semicolons (Prettier configured)

## Project structure
```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── interceptors/
│   │   └── auth.interceptor.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── services/
│       └── auth.service.ts
├── shared/                  # Reusable components, pipes, interfaces
│   ├── components/
│   ├── pipes/
│   └── interfaces/
│       └── space.interface.ts
├── features/                # Feature modules (lazy loaded)
│   ├── admin/
│   ├── auth/
│   └── reservations/
└── app.config.ts
```

## Component conventions
```typescript
@Component({
  selector: 'app-spaces-list',
  standalone: true,
  imports: [CommonModule, McTableComponent],
  templateUrl: './spaces-list.component.html',
})
export class SpacesListComponent {
  private spacesService = inject(SpacesService);
  
  spaces = signal<Space[]>([]);
  loading = signal(false);
}
```

## Service conventions
```typescript
@Injectable({ providedIn: 'root' })
export class SpacesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getSpaces(): Observable<Space[]> {
    return this.http.get<{data: Space[]}>(`${this.apiUrl}/spaces`)
      .pipe(map(res => res.data));
  }
}
```

## MC-Table usage (@matiascamiletti/mc-kit)
```html
<mc-table 
  [data]="spaces()" 
  [columns]="columns"
  [loading]="loading()"
  (onRowSelect)="onSelect($event)">
</mc-table>
```

```typescript
columns: McTableColumn[] = [
  { field: 'name', header: 'Nombre', sortable: true },
  { field: 'capacity', header: 'Capacidad', sortable: true },
  { field: 'is_active', header: 'Estado', type: 'boolean' },
  { field: 'actions', header: 'Acciones', type: 'template' }
];
```

## Styling
- Use TailwindCSS utility classes
- Avoid inline styles
- Import only needed PrimeNG modules

## Authentication
- JWT token stored in localStorage
- AuthInterceptor adds token to all requests
- AuthGuard protects private routes

## Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Security considerations
- Never store sensitive data in localStorage without encryption
- Always type HTTP responses with interfaces
- Validate user input before sending to API

## PR instructions
- Title format: `[frontend] <Title>`
- Always run `pnpm build` and `pnpm test` before committing
- Commit message format: `feat:`, `fix:`, `style:`, `refactor:`, `test:`
