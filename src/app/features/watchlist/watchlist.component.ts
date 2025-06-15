import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';

import { Stock, WatchlistItem } from '../../core/models/stock.model';
import { StockService } from '../../core/services/stock.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    RouterModule
  ],
  template: `
    <div class="watchlist-container">
      <div class="watchlist-header">
        <h1>Watchlist</h1>
        <p>Keep track of your favorite stocks</p>
      </div>
      
      <!-- Add Stock Form -->
      <mat-card class="add-stock-card">
        <mat-card-header>
          <mat-card-title>Add Stock to Watchlist</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="addStockForm" (ngSubmit)="addStock()" class="add-stock-form">
            <mat-form-field appearance="outline" class="symbol-input">
              <mat-label>Stock Symbol</mat-label>
              <input matInput formControlName="symbol" placeholder="e.g., AAPL, GOOGL" 
                     (input)="onSymbolInput()" maxlength="10">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!addStockForm.valid || !isValidSymbol">
              <mat-icon>add</mat-icon>
              Add to Watchlist
            </button>
          </form>
        </mat-card-content>
      </mat-card>
      
      <!-- Watchlist Table -->
      <mat-card class="watchlist-table-card">
        <mat-card-header>
          <mat-card-title>Your Watchlist ({{ watchlistStocks.length }})</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="watchlistStocks.length === 0" class="empty-state">
            <mat-icon>visibility</mat-icon>
            <h3>Your watchlist is empty</h3>
            <p>Add stocks to your watchlist to monitor their performance.</p>
          </div>
          
          <div *ngIf="watchlistStocks.length > 0" class="table-container">
            <table mat-table [dataSource]="watchlistStocks" class="full-width">
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
                <td mat-cell *matCellDef="let stock">{{ stock.price | currency }}</td>
              </ng-container>
              
              <ng-container matColumnDef="change">
                <th mat-header-cell *matHeaderCellDef>Change</th>
                <td mat-cell *matCellDef="let stock">
                  <mat-chip [class]="stock.change >= 0 ? 'positive-chip' : 'negative-chip'">
                    <mat-icon>{{ stock.change >= 0 ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                    {{ stock.change | currency }} ({{ stock.changePercent | number:'1.2-2' }}%)
                  </mat-chip>
                </td>
              </ng-container>
              
              <ng-container matColumnDef="volume">
                <th mat-header-cell *matHeaderCellDef>Volume</th>
                <td mat-cell *matCellDef="let stock">{{ stock.volume | number }}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let stock; let i = index">
                  <button mat-icon-button color="primary" 
                          routerLink="/trade" [queryParams]="{symbol: stock.symbol}">
                    <mat-icon>add_shopping_cart</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="removeStock(i)">
                    <mat-icon>delete</mat-icon>
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
    .watchlist-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .watchlist-header {
      margin-bottom: 32px;
      text-align: center;
    }
    
    .watchlist-header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .watchlist-header p {
      margin: 0;
      color: #666;
    }
    
    .add-stock-card {
      margin-bottom: 32px;
    }
    
    .add-stock-form {
      display: flex;
      gap: 16px;
      align-items: flex-end;
    }
    
    .symbol-input {
      flex: 1;
    }
    
    .add-stock-form button {
      height: 56px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .table-container {
      overflow-x: auto;
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
    
    .positive-chip {
      background-color: #e8f5e8 !important;
      color: #2e7d32 !important;
    }
    
    .negative-chip {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }
    
    .positive-chip mat-icon,
    .negative-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-state h3 {
      margin: 0 0 8px 0;
      font-weight: 500;
    }
    
    .empty-state p {
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .watchlist-container {
        padding: 16px;
      }
      
      .add-stock-form {
        flex-direction: column;
        align-items: stretch;
      }
      
      .add-stock-form button {
        height: 48px;
        justify-content: center;
      }
    }
  `]
})
export class WatchlistComponent implements OnInit {
  displayedColumns: string[] = ['symbol', 'price', 'change', 'volume', 'actions'];
  addStockForm!: FormGroup;
  watchlistStocks: Stock[] = [];
  isValidSymbol = false;
  
  // Mock stock data
  mockStocks: { [key: string]: Stock } = {
    'AAPL': {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.52,
      change: 2.34,
      changePercent: 1.30,
      volume: 45678900,
      marketCap: 2800000000000,
      high: 184.12,
      low: 179.85,
      open: 180.22,
      previousClose: 180.18
    },
    'GOOGL': {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 138.45,
      change: -1.87,
      changePercent: -1.33,
      volume: 23456789,
      marketCap: 1750000000000,
      high: 140.22,
      low: 137.89,
      open: 139.45,
      previousClose: 140.32
    },
    'MSFT': {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 378.90,
      change: 5.67,
      changePercent: 1.52,
      volume: 34567890,
      marketCap: 2900000000000,
      high: 380.45,
      low: 375.22,
      open: 376.12,
      previousClose: 373.23
    },
    'TSLA': {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 248.73,
      change: -8.45,
      changePercent: -3.29,
      volume: 56789012,
      marketCap: 790000000000,
      high: 255.67,
      low: 246.89,
      open: 254.12,
      previousClose: 257.18
    },
    'AMZN': {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 155.89,
      change: 3.45,
      changePercent: 2.26,
      volume: 38765432,
      marketCap: 1600000000000,
      high: 157.22,
      low: 152.33,
      open: 153.78,
      previousClose: 152.44
    }
  };

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.addStockForm = this.fb.group({
      symbol: ['']
    });
    
    // Load existing watchlist (mock data for demo)
    this.loadWatchlist();
  }

  loadWatchlist() {
    // In a real app, this would load from the service
    // For demo, we'll start with a few stocks
    this.watchlistStocks = [
      this.mockStocks['AAPL'],
      this.mockStocks['GOOGL'],
      this.mockStocks['MSFT']
    ];
  }

  onSymbolInput() {
    const symbol = this.addStockForm.get('symbol')?.value?.toUpperCase();
    this.isValidSymbol = !!symbol && !!this.mockStocks[symbol] && 
                        !this.watchlistStocks.find(stock => stock.symbol === symbol);
  }

  addStock() {
    if (this.addStockForm.valid && this.isValidSymbol) {
      const symbol = this.addStockForm.get('symbol')?.value?.toUpperCase();
      const stock = this.mockStocks[symbol];
      
      if (stock && !this.watchlistStocks.find(s => s.symbol === symbol)) {
        this.watchlistStocks.push(stock);
        this.addStockForm.reset();
        this.isValidSymbol = false;
        
        this.snackBar.open(
          `${symbol} has been added to your watchlist!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      }
    }
  }

  removeStock(index: number) {
    const stock = this.watchlistStocks[index];
    this.watchlistStocks.splice(index, 1);
    
    this.snackBar.open(
      `${stock.symbol} has been removed from your watchlist`,
      'Close',  
      { duration: 3000 }
    );
  }
}