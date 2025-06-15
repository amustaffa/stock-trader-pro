import { createAction, props } from '@ngrx/store';
import { User, LoginRequest } from '../../core/models/user.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Check Auth Status
export const checkAuthStatus = createAction('[Auth] Check Auth Status');

export const setAuthenticatedUser = createAction(
  '[Auth] Set Authenticated User',
  props<{ user: User; token: string }>()
);

// Clear Auth Error
export const clearAuthError = createAction('[Auth] Clear Auth Error');