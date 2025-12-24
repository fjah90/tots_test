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
- **Filtro avanzado de disponibilidad**:
  - Por fecha (muestra espacios con horarios libres)
  - Por rango horario (hora inicio/fin)
  - Búsqueda por nombre/ubicación
  - Filtro por capacidad
- Infinite scroll para carga progresiva
- Detalle de espacio con carousel de imágenes
- Calendario de disponibilidad (FullCalendar)
- Dark mode (Light/Dark/System)

### Autenticadas
- Crear reservaciones (fecha simple)
- **Crear reservaciones en múltiples fechas** (modo bulk)
- Ver mis reservaciones
- **Cancelar reservaciones** (con diálogo de confirmación)
- Fecha preseleccionada desde filtro de búsqueda

### Admin
- CRUD de espacios (MC-Table)
- CRUD de reservaciones
- Dashboard de estadísticas
- Gestión de múltiples imágenes

## Funcionalidades Destacadas

### Filtro Avanzado de Espacios
El listado de espacios permite filtrar por:
1. **Nombre/Ubicación**: Búsqueda de texto libre
2. **Fecha de disponibilidad**: Muestra solo espacios disponibles en esa fecha
3. **Rango horario**: Filtra por hora de inicio y fin (ej: 09:00 - 12:00)
4. **Capacidad**: Slider de rango (0-100+ personas)

Los filtros de hora solo se activan cuando hay una fecha seleccionada.

### Reservaciones en Múltiples Fechas
El formulario de reservación incluye un modo "múltiples fechas" que permite:
- Seleccionar varias fechas para el mismo horario
- Ver cuáles reservaciones se crearon exitosamente
- Ver cuáles fallaron (espacio ocupado) con detalle del error

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
