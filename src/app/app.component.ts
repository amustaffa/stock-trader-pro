import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AppState } from './store/app.reducer';
import * as AuthActions from './store/auth/auth.actions';
import { selectCurrentUser, selectIsAuthenticated, selectAuthLoading } from './store/auth/auth.selectors';
import { User } from './core/models/user.model';
import { SignalRService, RealTimeUpdate } from './core/services/signalr.service';
import { NotificationService } from './core/services/notification.service';
import { RealTimeIndicatorComponent } from './shared/components/real-time-indicator/real-time-indicator.component';
import { NotificationPanelComponent } from './shared/components/notification-panel/notification-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressBarModule,
    RealTimeIndicatorComponent,
    NotificationPanelComponent
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <span class="app-title">
          <mat-icon>trending_up</mat-icon>
          StockTrader Pro
        </span>
        
        <span class="spacer"></span>
        
        <!-- Real-time connection indicator -->
        <app-real-time-indicator *ngIf="isAuthenticated$ | async"></app-real-time-indicator>
        
        <div *ngIf="isAuthenticated$ | async" class="toolbar-actions">
          <!-- Notification panel -->
          <app-notification-panel></app-notification-panel>
          
          <!-- User menu -->
          <div class="user-menu">
            <button mat-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              {{ (currentUser$ | async)?.username }}
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </mat-menu>
          </div>
        </div>
      </mat-toolbar>
      
      <mat-progress-bar 
        *ngIf="isLoading$ | async" 
        mode="indeterminate"
        class="loading-bar">
      </mat-progress-bar>
      
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-menu button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .loading-bar {
      position: absolute;
      top: 64px;
      left: 0;
      right: 0;
      z-index: 999;
    }
    
    .app-content {
      flex: 1;
      overflow: auto;
    }
    
    @media (max-width: 768px) {
      .app-title span {
        display: none;
      }
      
      .toolbar-actions {
        gap: 4px;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  isLoading$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private signalRService: SignalRService,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.store.select(selectCurrentUser);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isLoading$ = this.store.select(selectAuthLoading);
  }

  ngOnInit() {
    this.store.dispatch(AuthActions.checkAuthStatus());
    
    // Setup SignalR connection when user is authenticated
    this.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (isAuthenticated) => {
        if (isAuthenticated) {
          try {
            await this.signalRService.startConnection();
            await this.signalRService.subscribeToPortfolio();
            
            // Start mock price updates for demo
            this.signalRService.startMockPriceUpdates();
            
            this.setupRealTimeUpdateHandlers();
          } catch (error) {
            console.error('Failed to establish SignalR connection:', error);
            this.notificationService.showToast(
              'Real-time updates unavailable. Some features may be limited.',
              'warning'
            );
          }
        } else {
          await this.signalRService.stopConnection();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.signalRService.stopConnection();
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  private setupRealTimeUpdateHandlers(): void {
    this.signalRService.realTimeUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe((update: RealTimeUpdate) => {
        this.handleRealTimeUpdate(update);
      });
  }

  private handleRealTimeUpdate(update: RealTimeUpdate): void {
    switch (update.type) {
      case 'STOCK_PRICE':
        this.handleStockPriceUpdate(update.data);
        break;
      case 'TRADE_EXECUTED':
        this.handleTradeExecution(update.data);
        break;
      case 'PORTFOLIO_UPDATE':
        this.handlePortfolioUpdate(update.data);
        break;
      case 'MARKET_NEWS':
        this.handleMarketNews(update.data);
        break;
    }
  }

  private handleStockPriceUpdate(stock: any): void {
    // Check for significant price movements (>5%)
    if (Math.abs(stock.changePercent) > 5) {
      this.notificationService.addNotification({
        type: stock.changePercent > 0 ? 'success' : 'warning',
        title: 'Significant Price Movement',
        message: `${stock.symbol} ${stock.changePercent > 0 ? 'gained' : 'lost'} ${Math.abs(stock.changePercent).toFixed(2)}%`,
        actionUrl: `/trade?symbol=${stock.symbol}`
      });
    }
  }

  private handleTradeExecution(trade: any): void {
    this.notificationService.handleTradeExecution(
      trade.symbol,
      trade.type,
      trade.quantity,
      trade.price
    );
  }

  private handlePortfolioUpdate(portfolio: any): void {
    // Check for portfolio milestones
    const totalValue = portfolio.totalValue;
    if (totalValue >= 100000 && totalValue < 100500) {
      this.notificationService.handlePortfolioMilestone('Portfolio reached $100K', totalValue);
    } else if (totalValue >= 250000 && totalValue < 250500) {
      this.notificationService.handlePortfolioMilestone('Portfolio reached $250K', totalValue);
    }
  }

  private handleMarketNews(news: any): void {
    this.notificationService.addNotification({
      type: 'info',
      title: 'Market News',
      message: news.headline || 'New market update available',
      actionUrl: '/dashboard'
    });
  }
}