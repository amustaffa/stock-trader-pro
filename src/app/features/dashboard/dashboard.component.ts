import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { Stock } from '../../core/models/stock.model';
import { Portfolio } from "../../core/models/Portfolio";
import { AppState } from '../../store/app.reducer';
import * as StockActions from '../../store/stock/stock.actions';
import * as PortfolioActions from '../../store/portfolio/portfolio.actions';
import { selectAllStocks, selectStocksLoading } from '../../store/stock/stock.selectors';
import { selectPortfolio, selectPortfolioLoading } from '../../store/portfolio/portfolio.selectors';
import { SignalRService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your portfolio overview.</p>
        <div class="last-updated" *ngIf="lastUpdated">
          <mat-icon>schedule</mat-icon>
          Last updated: {{ lastUpdated | date:'short' }}
        </div>
      </div>
      
      <!-- Portfolio Summary -->
      <div class="summary-cards">
        <mat-card class="summary-card" [class.loading]="portfolioLoading$ | async">
          <mat-card-content>
            <div class="summary-content">
              <div class="summary-icon positive">
                <mat-icon>account_balance_wallet</mat-icon>
              </div>
              <div class="summary-details">
                <h3>Total Portfolio Value</h3>
                <p class="amount">{{ (portfolio$ | async)?.totalValue | currency }}</p>
                <div class="real-time-badge" *ngIf="isRealTimeConnected">
                  <mat-icon>wifi</mat-icon>
                  <span>Live</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="summary-card" [class.loading]="portfolioLoading$ | async">
          <mat-card-content>
            <div class="summary-content">
              <div class="summary-icon" [class]="((portfolio$ | async)?.totalGainLoss ?? 0) >= 0 ? 'positive' : 'negative'">
                <mat-icon>{{ ((portfolio$ | async)?.totalGainLoss ?? 0) >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              </div>
              <div class="summary-details">
                <h3>Total Gain/Loss</h3>
                <p class="amount" [class]="((portfolio$ | async)?.totalGainLoss ?? 0) >= 0 ? 'positive-text' : 'negative-text'">
                  {{ (portfolio$ | async)?.totalGainLoss | currency }}
                  ({{ (portfolio$ | async)?.totalGainLossPercent | number:'1.2-2' }}%)
                </p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-content">
              <div class="summary-icon neutral">
                <mat-icon>pie_chart</mat-icon>
              </div>
              <div class="summary-details">
                <h3>Holdings</h3>
                <p class="amount">{{ (portfolio$ | async)?.items?.length || 0 }} Stocks</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Quick Actions -->
      <mat-card class="actions-card">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-raised-button color="primary" routerLink="/trade">
              <mat-icon>add_shopping_cart</mat-icon>
              Buy Stocks
            </button>
            <button mat-raised-button color="accent" routerLink="/portfolio">
              <mat-icon>pie_chart</mat-icon>
              View Portfolio
            </button>
            <button mat-raised-button routerLink="/watchlist">
              <mat-icon>visibility</mat-icon>
              Watchlist
            </button>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Top Stocks -->
      <mat-card class="stocks-card">
        <mat-card-header>
          <mat-card-title>Market Movers</mat-card-title>
          <mat-card-subtitle>
            Top performing stocks today
            <span class="live-indicator" *ngIf="isRealTimeConnected">
              <mat-icon>fiber_manual_record</mat-icon>
              LIVE
            </span>
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="stocks-table" [class.loading]="stocksLoading$ | async">
            <table mat-table [dataSource]="(stocks$ | async) ?? []" class="full-width">
              <ng-container matColumnDef="symbol">
                <th mat-header-cell *matHeaderCellDef>Symbol</th>
                <td mat-cell *matCellDef="let stock">
                  <div class="stock-symbol">
                    <strong>{{ stock.symbol }}</strong>
                    <small>{{ stock.name }}</small>
                  </div>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let stock">
                  <div class="price-cell" [class.price-updated]="isStockUpdated(stock.symbol)">
                    {{ stock.price | currency }}
                  </div>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="change">
                <th mat-header-cell *matHeaderCellDef>Change</th>
                <td mat-cell *matCellDef="let stock">
                  <mat-chip [class]="stock.change >= 0 ? 'positive-chip' : 'negative-chip'"
                           [class.change-updated]="isStockUpdated(stock.symbol)">
                    <mat-icon>{{ stock.change >= 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    {{ stock.change | currency }} ({{ stock.changePercent | number:'1.2-2' }}%)
                  </mat-chip>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let stock">
                  <button mat-icon-button color="primary" routerLink="/trade" [queryParams]="{symbol: stock.symbol}">
                    <mat-icon>add_shopping_cart</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      margin-bottom: 32px;
      position: relative;
    }
    
    .dashboard-header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .dashboard-header p {
      margin: 0;
      color: #666;
    }
    
    .last-updated {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #999;
      margin-top: 8px;
    }
    
    .last-updated mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    
    .summary-card {
      height: 120px;
      position: relative;
      overflow: hidden;
    }
    
    .summary-card.loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .summary-content {
      display: flex;
      align-items: center;
      height: 100%;
      gap: 16px;
    }
    
    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
    }
    
    .summary-icon.positive {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .summary-icon.negative {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .summary-icon.neutral {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .summary-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    
    .summary-details {
      flex: 1;
      position: relative;
    }
    
    .summary-details h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .summary-details .amount {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
    
    .real-time-badge {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      color: #2e7d32;
      background-color: #e8f5e8;
      padding: 2px 6px;
      border-radius: 8px;
    }
    
    .real-time-badge mat-icon {
      font-size: 10px;
      width: 10px;
      height: 10px;
    }
    
    .positive-text {
      color: #2e7d32 !important;
    }
    
    .negative-text {
      color: #c62828 !important;
    }
    
    .actions-card {
      margin-bottom: 32px;
    }
    
    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .stocks-card {
      margin-bottom: 32px;
    }
    
    .live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      color: #2e7d32;
      margin-left: 8px;
      animation: pulse 2s infinite;
    }
    
    .live-indicator mat-icon {
      font-size: 8px;
      width: 8px;
      height: 8px;
    }
    
    .stocks-table {
      overflow-x: auto;
      position: relative;
    }
    
    .stocks-table.loading::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: loading 1.5s infinite;
    }
    
    .full-width {
      width: 100%;
    }
    
    .stock-symbol strong {
      display: block;
      font-size: 14px;
    }
    
    .stock-symbol small {
      display: block;
      color: #666;
      font-size: 12px;
    }
    
    .price-cell {
      transition: all 0.3s ease;
    }
    
    .price-cell.price-updated {
      background-color: #fff3e0;
      padding: 4px 8px;
      border-radius: 4px;
      animation: priceFlash 1s ease-out;
    }
    
    @keyframes priceFlash {
      0% { background-color: #ffeb3b; }
      100% { background-color: #fff3e0; }
    }
    
    .positive-chip {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
      transition: all 0.3s ease;
    }
    
    .negative-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
      transition: all 0.3s ease;
    }
    
    .change-updated {
      animation: changeFlash 1s ease-out;
    }
    
    @keyframes changeFlash {
      0% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .positive-chip mat-icon,
    .negative-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
      
      .summary-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .action-buttons button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'actions'];
  
  stocks$: Observable<Stock[]>;
  portfolio$: Observable<Portfolio | null>;
  stocksLoading$: Observable<boolean>;
  portfolioLoading$: Observable<boolean>;
  
  lastUpdated: Date | null = null;
  isRealTimeConnected = false;
  private recentlyUpdatedStocks = new Set<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private signalRService: SignalRService
  ) {
    this.stocks$ = this.store.select(selectAllStocks);
    this.portfolio$ = this.store.select(selectPortfolio);
    this.stocksLoading$ = this.store.select(selectStocksLoading);
    this.portfolioLoading$ = this.store.select(selectPortfolioLoading);
  }

  ngOnInit() {
    // Load initial data
    this.store.dispatch(StockActions.loadStocks());
    this.store.dispatch(PortfolioActions.loadPortfolio());
    
    // Monitor SignalR connection status
    this.signalRService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isRealTimeConnected = state === 'Connected';
      });
    
    // Monitor real-time updates
    this.signalRService.realTimeUpdates$
      .pipe(takeUntil(this.destroy$))
      .subscribe(update => {
        this.lastUpdated = update.timestamp;
        
        if (update.type === 'STOCK_PRICE') {
          // Track recently updated stocks for visual feedback
          this.recentlyUpdatedStocks.add(update.data.symbol);
          setTimeout(() => {
            this.recentlyUpdatedStocks.delete(update.data.symbol);
          }, 2000);
        }
      });
    
    // Subscribe to stock updates for dashboard stocks
    // this.stocks$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(async (stocks) => {
    //     if (this.signalRService.isConnected()) {
    //       for (const stock of stocks) {
    //         await this.signalRService.subscribeToStock(stock.symbol);
    //       }
    //     }
    //   });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isStockUpdated(symbol: string): boolean {
    return this.recentlyUpdatedStocks.has(symbol);
  }
}