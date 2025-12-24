import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    DrawerModule,
    TooltipModule,
    RippleModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  // Estado del menú móvil
  mobileMenuVisible = signal(false);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly currentUser = this.authService.currentUser;

  // Theme
  readonly selectedTheme = this.themeService.selectedTheme;
  readonly effectiveTheme = this.themeService.effectiveTheme;
  readonly themeIcon = computed(() => {
    const theme = this.selectedTheme();
    if (theme === 'system') return 'pi pi-desktop';
    return theme === 'dark' ? 'pi pi-moon' : 'pi pi-sun';
  });
  readonly themeTooltip = computed(() => {
    const theme = this.selectedTheme();
    if (theme === 'system') return 'Tema: Sistema';
    return theme === 'dark' ? 'Tema: Oscuro' : 'Tema: Claro';
  });

  toggleMobileMenu(): void {
    this.mobileMenuVisible.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuVisible.set(false);
  }

  cycleTheme(): void {
    this.themeService.cycleTheme();
  }

  logout(): void {
    this.authService.logout().subscribe();
    this.closeMobileMenu();
  }
}
