import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have null currentUser initially', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('should have null token initially', () => {
      expect(service.token()).toBeNull();
    });

    it('should not be authenticated initially', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should not be admin initially', () => {
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('login()', () => {
    it('should login and store token', () => {
      const mockResponse = {
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' as const },
        token: 'mock-token-123',
        message: 'Login exitoso',
      };

      service.login({ email: 'test@example.com', password: 'password123' }).subscribe((response) => {
        expect(response.token).toBe('mock-token-123');
        expect(response.user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'password123' });
      req.flush(mockResponse);

      // Verify state was updated
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('test@example.com');
      expect(service.token()).toBe('mock-token-123');
    });

    it('should set isAdmin to true for admin users', () => {
      const mockResponse = {
        user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' as const },
        token: 'admin-token-123',
        message: 'Login exitoso',
      };

      service.login({ email: 'admin@example.com', password: 'password123' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(service.isAdmin()).toBe(true);
    });

    it('should persist token to localStorage', () => {
      const mockResponse = {
        user: { id: 1, name: 'Test', email: 'test@example.com', role: 'user' as const },
        token: 'persistent-token',
        message: 'Login exitoso',
      };

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);

      expect(localStorage.getItem('auth_token')).toBe('persistent-token');
      expect(JSON.parse(localStorage.getItem('auth_user') || '{}').email).toBe('test@example.com');
    });
  });

  describe('register()', () => {
    it('should register and store token', () => {
      const mockResponse = {
        user: { id: 2, name: 'New User', email: 'new@example.com', role: 'user' as const },
        token: 'new-token-456',
        message: 'Usuario registrado exitosamente',
      };

      const payload = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      };

      service.register(payload).subscribe((response) => {
        expect(response.user.name).toBe('New User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout()', () => {
    it('should clear auth state on logout', () => {
      // First login
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify({ id: 1, email: 'test@example.com' }));

      // Recreate service to pick up localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });
      service = TestBed.inject(AuthService);
      httpMock = TestBed.inject(HttpTestingController);

      service.logout().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/logout`);
      req.flush({});

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('getProfile()', () => {
    it('should fetch and update user profile', () => {
      const mockUser = { id: 1, name: 'Profile User', email: 'profile@example.com', role: 'user' as const };

      service.getProfile().subscribe((user) => {
        expect(user.name).toBe('Profile User');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      expect(service.currentUser()?.name).toBe('Profile User');
    });
  });

  describe('hasValidToken()', () => {
    it('should return false when no token', () => {
      expect(service.hasValidToken()).toBe(false);
    });

    it('should return true when token exists in localStorage', () => {
      localStorage.setItem('auth_token', 'valid-token');

      // Recreate service to pick up localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });
      service = TestBed.inject(AuthService);

      expect(service.hasValidToken()).toBe(true);
    });
  });
});
