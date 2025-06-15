import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../store/app.reducer';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="login-icon">trending_up</mat-icon>
            <h1>StockTrader Pro</h1>
            <p>Sign in to your account</p>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter your username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                Username is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" 
                     formControlName="password" placeholder="Enter your password">
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" 
                      type="button" [attr.aria-label]="'Hide password'" 
                      [attr.aria-pressed]="hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <div *ngIf="authError$ | async" class="error-message">
              {{ authError$ | async }}
            </div>
            
            <button mat-raised-button color="primary" type="submit" 
                    class="login-button" [disabled]="loginForm.invalid || (isLoading$ | async)">
              <mat-spinner *ngIf="isLoading$ | async" diameter="20"></mat-spinner>
              <span *ngIf="!(isLoading$ | async)">Sign In</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
      
      <div class="demo-credentials">
        <mat-card>
          <mat-card-content>
            <h3>Demo Credentials</h3>
            <p><strong>Username:</strong> demo</p>
            <p><strong>Password:</strong> password123</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .login-card {
      width: 100%;
      max-width: 400px;
      margin-bottom: 24px;
    }
    
    .login-header {
      text-align: center;
      padding: 24px 0;
    }
    
    .login-header .login-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }
    
    .login-header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .login-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .error-message {
      color: #f44336;
      font-size: 14px;
      text-align: center;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
    }
    
    .login-button {
      height: 48px;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .demo-credentials {
      width: 100%;
      max-width: 400px;
    }
    
    .demo-credentials mat-card-content {
      text-align: center;
      padding: 16px;
    }
    
    .demo-credentials h3 {
      margin: 0 0 12px 0;
      color: #1976d2;
    }
    
    .demo-credentials p {
      margin: 4px 0;
      font-size: 14px;
    }
    
    @media (max-width: 480px) {
      .login-container {
        padding: 16px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  
  isAuthenticated$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  authError$: Observable<string | null>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isLoading$ = this.store.select(selectAuthLoading);
    this.authError$ = this.store.select(selectAuthError);
  }

  ngOnInit() {
    // Redirect if already authenticated
    this.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/dashboard']);
      }
    });

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({
        credentials: this.loginForm.value
      }));
    }
  }
}