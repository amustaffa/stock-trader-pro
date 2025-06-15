import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { appReducers } from './app/store/app.reducer';
import { AuthEffects } from './app/store/auth/auth.effects';
import { StockEffects } from './app/store/stock/stock.effects';
import { PortfolioEffects } from './app/store/portfolio/portfolio.effects';
import { WatchlistEffects } from './app/store/watchlist/watchlist.effects';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    importProvidersFrom(MatSnackBarModule),
    provideStore(appReducers),
    provideEffects([AuthEffects, StockEffects, PortfolioEffects, WatchlistEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ]
});