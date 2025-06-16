import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

import { Portfolio, PortfolioItem, TradeOrder } from '../../core/models/stock.model';
import { StockService } from '../../core/services/stock.service';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,  
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    RouterModule
  ],
  template: `
    <div class="portfolio-container">
      <div class="portfolio-header">
        <h1>Portfolio</h1>
        <button mat-raised-button color="primary" routerLink="/trade">
          <mat-icon>add_shopping_cart</mat-icon>
          Trade
        </button>
      </div>
      
      <!-- Portfolio Summary -->
      <div class="portfolio-summary">
        <mat-card class="summary-card">
          <mat-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <h3>Total Value</h3>
                <p class="value">{{ this.portfolio.totalValue | currency }}</p>
              </div>
              <div class="summary-item">
                <h3>Total Gain/Loss</h3>
                <p class="value" [class]="this.portfolio.totalGainLoss >= 0 ? 'positive' : 'negative'">
                  {{ this.portfolio.totalGainLoss | currency }}
                </p>
              </div>
              <div class="summary-item">
                <h3>Percentage</h3>
                <p class="value" [class]="this.portfolio.totalGainLossPercent >= 0 ? 'positive' : 'negative'">
                  {{ this.portfolio.totalGainLossPercent | number:'1.2-2' }}%
                </p>
              </div>
              <div class="summary-item">
                <h3>Holdings</h3>
                <p class="value">{{ this.portfolio.items.length }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <mat-tab-group class="portfolio-tabs">
        <!-- Holdings Tab -->
        <mat-tab label="Holdings">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Current Holdings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="this.portfolio.items" class="full-width">
                    <ng-container matColumnDef="symbol">
                      <th mat-header-cell *matHeaderCellDef>Symbol</th>
                      <td mat-cell *matCellDef="let holding">
                        <strong>{{ holding.symbol }}</strong>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="quantity">
                      <th mat-header-cell *matHeaderCellDef>Quantity</th>
                      <td mat-cell *matCellDef="let holding">{{ holding.quantity }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="averagePrice">
                      <th mat-header-cell *matHeaderCellDef>Avg Price</th>
                      <td mat-cell *matCellDef="let holding">{{ holding.averagePrice | currency }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="currentPrice">
                      <th mat-header-cell *matHeaderCellDef>Current Price</th>
                      <td mat-cell *matCellDef="let holding">{{ holding.currentPrice | currency }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="totalValue">
                      <th mat-header-cell *matHeaderCellDef>Total Value</th>
                      <td mat-cell *matCellDef="let holding">{{ holding.totalValue | currency }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="gainLoss">
                      <th mat-header-cell *matHeaderCellDef>Gain/Loss</th>
                      <td mat-cell *matCellDef="let holding">
                        <div class="gain-loss" [class]="holding.gainLoss >= 0 ? 'positive' : 'negative'">
                          <div>{{ holding.gainLoss | currency }}</div>
                          <small>({{ holding.gainLossPercent | number:'1.2-2' }}%)</small>
                        </div>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>Actions</th>
                      <td mat-cell *matCellDef="let holding">
                        <button mat-icon-button color="primary" 
                                routerLink="/trade" 
                                [queryParams]="{symbol: holding.symbol, type: 'SELL'}">
                          <mat-icon>sell</mat-icon>
                        </button>
                        <button mat-icon-button color="accent"
                                routerLink="/trade" 
                                [queryParams]="{symbol: holding.symbol, type: 'BUY'}">
                          <mat-icon>add_shopping_cart</mat-icon>
                        </button>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="holdingsColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: holdingsColumns;"></tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Trade History Tab -->
        <mat-tab label="Trade History">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Recent Trades</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="table-container">
                  <table mat-table [dataSource]="mockTradeHistory" class="full-width">
                    <ng-container matColumnDef="date">
                      <th mat-header-cell *matHeaderCellDef>Date</th>
                      <td mat-cell *matCellDef="let trade">{{ trade.createdAt | date:'short' }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="symbol">
                      <th mat-header-cell *matHeaderCellDef>Symbol</th>
                      <td mat-cell *matCellDef="let trade">
                        <strong>{{ trade.symbol }}</strong>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="type">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let trade">
                        <span class="trade-type" [class]="trade.type === 1 ? 'buy' : 'sell'">
                          {{ trade.type === 1 ? 'buy' : 'sell' }}
                        </span>
                      </td>
                    </ng-container>
                    
                    <ng-container matColumnDef="quantity">
                      <th mat-header-cell *matHeaderCellDef>Quantity</th>
                      <td mat-cell *matCellDef="let trade">{{ trade.quantity }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="price">
                      <th mat-header-cell *matHeaderCellDef>Price</th>
                      <td mat-cell *matCellDef="let trade">{{ trade.price | currency }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="total">
                      <th mat-header-cell *matHeaderCellDef>Total</th>
                      <td mat-cell *matCellDef="let trade">{{ (trade.quantity * trade.price) | currency }}</td>
                    </ng-container>
                    
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let trade">
                        <span class="status" [class]="trade.status?.toLowerCase()">
                          {{ trade.status }}
                        </span>
                      </td>
                    </ng-container>
                    
                    <tr mat-header-row *matHeaderRowDef="tradeColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: tradeColumns;"></tr>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .portfolio-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .portfolio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .portfolio-header h1 {
      margin: 0;
      color: #333;
      font-weight: 500;
    }
    
    .portfolio-header button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .portfolio-summary {
      margin-bottom: 32px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-item h3 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-item .value {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .summary-item .value.positive {
      color: #2e7d32;
    }
    
    .summary-item .value.negative {
      color: #c62828;
    }
    
    .portfolio-tabs {
      margin-bottom: 32px;
    }
    
    .tab-content {
      padding: 24px 0;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    .full-width {
      width: 100%;
    }
    
    .gain-loss.positive {
      color: #2e7d32;
    }
    
    .gain-loss.negative {
      color: #c62828;
    }
    
    .gain-loss small {
      display: block;
      font-size: 11px;
      opacity: 0.8;
    }
    
    .trade-type {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .trade-type.buy {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .trade-type.sell {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .status.executed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .status.pending {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .status.cancelled {
      background-color: #ffebee;
      color: #c62828;
    }
    
    @media (max-width: 768px) {
      .portfolio-container {
        padding: 16px;
      }
      
      .portfolio-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .portfolio-header button {
        justify-content: center;
      }
      
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      
      .summary-item .value {
        font-size: 20px;
      }
    }
    
    @media (max-width: 480px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PortfolioComponent implements OnInit {
  
  portfolio: Portfolio = {
    id: '1', // Default ID
    userId: 'user123', // Default User ID
    name: 'My Portfolio', // Default Name
    createdDate: new Date(), // Default Created Date
    lastUpdated: new Date(), // Default Last Updated
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    items: []
  };

  holdingsColumns: string[] = ['symbol', 'quantity', 'averagePrice', 'currentPrice', 'totalValue', 'gainLoss', 'actions'];
  tradeColumns: string[] = ['date', 'symbol', 'type', 'quantity', 'price', 'total', 'status'];
  
  mockTradeHistory: TradeOrder[] = [
    {
      id: '1',
      symbol: 'AAPL',
      type: 1,//'BUY',
      quantity: 50,
      price: 175.20,
      orderType: 1,//'MARKET',
      status: 'EXECUTED',
      createdAt: new Date('2024-01-15T10:30:00')
    },
    {
      id: '2',
      symbol: 'GOOGL',
      type: 2, //'SELL',
      quantity: 25,
      price: 142.80,
      orderType: 2,//'LIMIT',
      status: 'EXECUTED',
      createdAt: new Date('2024-01-14T14:15:00')
    },
    {
      id: '3',
      symbol: 'MSFT',
      type: 1,//'BUY',
      quantity: 25,
      price: 380.00,
      orderType: 1,//'MARKET',
      status: 'EXECUTED',
      createdAt: new Date('2024-01-12T09:45:00')
    },
    {
      id: '4',
      symbol: 'TSLA',
      type: 2, // SELL
      quantity: 10,
      price: 260.00,
      orderType: 2,//'LIMIT',
      status: 'PENDING',
      createdAt: new Date('2024-01-10T16:20:00')
    }
  ];

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.loadPortfolioData();
  }

  private loadPortfolioData() {
    
     this.stockService.getPortfolio().subscribe(portfolio => this.portfolio = portfolio);
    // this.stockService.getTradeHistory().subscribe(history => this.tradeHistory = history);
  }
}