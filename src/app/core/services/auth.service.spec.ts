import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser: User = {
    userid: '123',
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockLoginRequest: LoginRequest = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token',
    userid: mockUser
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');

      service.login(mockLoginRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockLoginResponse);
          expect(localStorage.getItem('auth_token')).toBe(mockLoginResponse.token);
          expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockLoginResponse.userid));
          expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);
    });

    it('should handle login error', () => {
      const errorMessage = 'Invalid credentials';

      service.login(mockLoginRequest).subscribe({
        error: (error) => {
          expect(error.error).toBe(errorMessage);
          expect(localStorage.getItem('auth_token')).toBeNull();
          expect(localStorage.getItem('current_user')).toBeNull();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: errorMessage }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('should clear auth data and navigate to login', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      
      // Setup initial auth state
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('checkAuthStatus', () => {
    it('should update auth status if valid token exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      service.checkAuthStatus();

      service.isAuthenticated().subscribe(isAuth => {
        expect(isAuth).toBe(true);
      });

      service.currentUser().subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should logout if stored user data is invalid', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', 'invalid-json');

      service.checkAuthStatus();

      service.isAuthenticated().subscribe(isAuth => {
        expect(isAuth).toBe(false);
      });

      service.currentUser().subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('getToken', () => {
    it('should return stored token', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if no token stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated and currentUser', () => {
    it('should return current authentication state', () => {
      service.isAuthenticated().subscribe(isAuth => {
        expect(isAuth).toBe(false);
      });
    });

    it('should return current user', () => {
      service.currentUser().subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });
});