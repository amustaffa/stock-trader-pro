import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import * as AuthActions from '../../store/auth/auth.actions';
import { selectIsAuthenticated, selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;
  let router: Router;

  const initialState = {
    auth: {
      isAuthenticated: false,
      isLoading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        LoginComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        {
          provide: Router,
          useValue: { navigate: jest.fn() as any }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with empty fields', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalsy();

    form.controls['email'].setValue('');
    form.controls['password'].setValue('');
    expect(form.valid).toBeFalsy();
    expect(form.controls['email'].errors?.['required']).toBeTruthy();
    expect(form.controls['password'].errors?.['required']).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.controls['email'];
    emailControl.setValue('invalid-email');
    expect(emailControl.errors?.['email']).toBeTruthy();

    emailControl.setValue('valid@email.com');
    expect(emailControl.errors).toBeFalsy();
  });

  it('should dispatch login action on valid form submission', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    component.loginForm.setValue(credentials);
    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      AuthActions.login({ credentials })
    );
  });

  it('should not dispatch login action on invalid form submission', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.onSubmit();
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard when authenticated', fakeAsync(() => {
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();
    tick();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should show loading spinner when isLoading is true', () => {
    store.overrideSelector(selectAuthLoading, true);
    store.refreshState();
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(
      By.css('mat-spinner')
    );
    expect(spinner).toBeTruthy();
  });

  it('should show error message when auth error exists', () => {
    const errorMessage = 'Invalid credentials';
    store.overrideSelector(selectAuthError, errorMessage);
    store.refreshState();
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(
      By.css('.error-message')
    );
    expect(errorElement.nativeElement.textContent).toContain(errorMessage);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBeTruthy();
    
    const toggleButton = fixture.debugElement.query(
      By.css('button[aria-label="Hide password"]')
    );
    toggleButton.triggerEventHandler('click', null);
    
    expect(component.hidePassword).toBeFalsy();
  });
});