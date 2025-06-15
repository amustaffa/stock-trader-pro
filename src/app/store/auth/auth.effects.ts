import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as AuthActions from './auth.actions';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthEffects {
  
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        // Simulate API call for demo
        new Promise(resolve => {
          setTimeout(() => {
            if (credentials.username === 'demo' && credentials.password === 'password123') {
              const mockResponse = {
                token: 'mock-jwt-token-' + Date.now(),
                user: {
                  id: '1',
                  username: credentials.username,
                  email: 'demo@example.com',
                  firstName: 'Demo',
                  lastName: 'User'
                }
              };
              resolve(mockResponse);
            } else {
              throw new Error('Invalid credentials');
            }
          }, 1000);
        }).then((response: any) => {
          // Store in localStorage
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          
          return AuthActions.loginSuccess({
            user: response.user,
            token: response.token
          });
        }).catch(error => 
          AuthActions.loginFailure({ error: error.message || 'Login failed' })
        )
      )
    )
  );
  
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(() => {
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      })
    ),
    { dispatch: false }
  );
  
  loginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginFailure),
      tap(({ error }) => {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      })
    ),
    { dispatch: false }
  );
  
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      map(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        return AuthActions.logoutSuccess();
      })
    )
  );
  
  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        this.router.navigate(['/login']);
        this.snackBar.open('Logged out successfully', 'Close', {
          duration: 3000
        });
      })
    ),
    { dispatch: false }
  );
  
  checkAuthStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthStatus),
      map(() => {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('current_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            return AuthActions.setAuthenticatedUser({ user, token });
          } catch (error) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('current_user');
            return AuthActions.logoutSuccess();
          }
        }
        
        return AuthActions.logoutSuccess();
      })
    )
  );

  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
}