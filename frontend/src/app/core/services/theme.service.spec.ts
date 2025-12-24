import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

// Mock window.matchMedia for test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have system as default theme when no stored preference', () => {
      expect(service.selectedTheme()).toBe('system');
    });
  });

  describe('setTheme()', () => {
    it('should set theme to light', () => {
      service.setTheme('light');
      expect(service.selectedTheme()).toBe('light');
    });

    it('should set theme to dark', () => {
      service.setTheme('dark');
      expect(service.selectedTheme()).toBe('dark');
    });

    it('should set theme to system', () => {
      service.setTheme('light');
      service.setTheme('system');
      expect(service.selectedTheme()).toBe('system');
    });
  });

  describe('cycleTheme()', () => {
    it('should cycle light -> dark -> system -> light', () => {
      service.setTheme('light');

      service.cycleTheme();
      expect(service.selectedTheme()).toBe('dark');

      service.cycleTheme();
      expect(service.selectedTheme()).toBe('system');

      service.cycleTheme();
      expect(service.selectedTheme()).toBe('light');
    });
  });

  describe('effectiveTheme', () => {
    it('should return light when theme is light', () => {
      service.setTheme('light');
      expect(service.effectiveTheme()).toBe('light');
    });

    it('should resolve system preference when theme is system', () => {
      service.setTheme('system');
      // Should return either 'light' or 'dark', not 'system'
      expect(['light', 'dark']).toContain(service.effectiveTheme());
    });
  });

  describe('localStorage persistence', () => {
    it('should restore theme from localStorage on init', () => {
      localStorage.setItem('spacebook-theme', 'dark');

      // Create new service instance to test initialization
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService],
      });
      const newService = TestBed.inject(ThemeService);

      expect(newService.selectedTheme()).toBe('dark');
    });

    it('should default to system for invalid stored values', () => {
      localStorage.setItem('spacebook-theme', 'invalid-theme');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService],
      });
      const newService = TestBed.inject(ThemeService);

      expect(newService.selectedTheme()).toBe('system');
    });
  });
});
