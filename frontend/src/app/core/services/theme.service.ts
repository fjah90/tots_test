import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'spacebook-theme';
  
  // Signal para el tema seleccionado por el usuario
  readonly selectedTheme = signal<Theme>(this.getStoredTheme());
  
  // Signal para el tema efectivo (resuelve 'system' al tema real)
  readonly effectiveTheme = signal<'light' | 'dark'>(this.resolveTheme(this.getStoredTheme()));

  constructor() {
    // Efecto para aplicar el tema cuando cambia
    effect(() => {
      const theme = this.selectedTheme();
      this.applyTheme(theme);
      this.storeTheme(theme);
    });

    // Escuchar cambios en las preferencias del sistema
    this.listenToSystemChanges();
  }

  /**
   * Cambiar el tema
   */
  setTheme(theme: Theme): void {
    this.selectedTheme.set(theme);
  }

  /**
   * Toggle entre light y dark (ignora system)
   */
  toggleTheme(): void {
    const current = this.effectiveTheme();
    this.selectedTheme.set(current === 'light' ? 'dark' : 'light');
  }

  /**
   * Ciclar entre: light -> dark -> system -> light
   */
  cycleTheme(): void {
    const current = this.selectedTheme();
    const next: Theme = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
    this.selectedTheme.set(next);
  }

  /**
   * Obtener el tema guardado en localStorage
   */
  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    const stored = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    
    // Por defecto, usar preferencia del sistema
    return 'system';
  }

  /**
   * Guardar tema en localStorage
   */
  private storeTheme(theme: Theme): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, theme);
    }
  }

  /**
   * Resolver el tema efectivo (convierte 'system' al tema real)
   */
  private resolveTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
      return this.getSystemPreference();
    }
    return theme;
  }

  /**
   * Obtener preferencia del sistema operativo
   */
  private getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Aplicar el tema al DOM
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const effectiveTheme = this.resolveTheme(theme);
    this.effectiveTheme.set(effectiveTheme);

    const root = document.documentElement;
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Escuchar cambios en las preferencias del sistema
   */
  private listenToSystemChanges(): void {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', () => {
      // Solo actualizar si el usuario eligió 'system'
      if (this.selectedTheme() === 'system') {
        this.applyTheme('system');
      }
    });
  }
}
