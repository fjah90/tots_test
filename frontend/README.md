# Frontend - SpaceBook

Sistema de reserva de espacios desarrollado con Angular 21.

## Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm start

# La aplicación estará en http://localhost:4200
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm test` | Ejecutar tests (Vitest) |
| `pnpm lint` | Linting del código |

## Tecnologías

- **Angular 21.0.6** - Framework principal
- **PrimeNG 21.0.2** - Componentes UI (Carousel, Dialog, DataPicker, Toast)
- **TailwindCSS 3.4.19** - Estilos utilitarios
- **FullCalendar 6.1.20** - Calendario interactivo
- **@mckit/table 19.0.14** - Tabla avanzada para admin
- **Vitest** - Testing (24 tests)

## Estructura

```
src/app/
├── core/                    # Servicios, guards, interceptors
├── shared/                  # Interfaces, pipes, componentes comunes
├── features/
│   ├── auth/                # Login, Register
│   ├── spaces/              # Listado, Detalle, Reservación
│   ├── reservations/        # Mis Reservaciones
│   ├── calendar/            # Calendario público
│   └── admin/               # Panel administrativo
└── app.routes.ts
```

## Características

### Públicas
- Listado de espacios con filtros y búsqueda
- **Filtro por fecha de disponibilidad** (muestra espacios con horarios libres)
- Infinite scroll para carga progresiva
- Detalle de espacio con carousel de imágenes
- Calendario de disponibilidad (FullCalendar)
- Dark mode (Light/Dark/System)

### Autenticadas
- Crear reservaciones
- Ver mis reservaciones
- **Cancelar reservaciones** (con diálogo de confirmación)
- Fecha preseleccionada desde filtro de búsqueda

### Admin
- CRUD de espacios (MC-Table)
- CRUD de reservaciones
- Dashboard de estadísticas
- Gestión de múltiples imágenes

## Configuración

El archivo `src/environments/environment.ts` contiene la URL del API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

## Tests

```bash
# Ejecutar todos los tests
pnpm test

# Con cobertura
pnpm test:coverage
```

Total: 24 tests
