import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Stock, TradeOrder } from '../../core/models/stock.model';
import { StockService } from '../../core/services/stock.service';
import { TradeConfirmationDialogComponent } from './trade-confirmation-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.reducer';
import * as PortfolioActions from '../../store/portfolio/portfolio.actions';

@Component({
  selector: 'app-trade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="trade-container">
      <div class="trade-header">
        <h1>Trade Stocks</h1>
        <p>Buy and sell stocks in real-time</p>
      </div>
      
      <div class="trade-content">
        <!-- Stock Search/Selection -->
        <mat-card class="stock-info-card">
          <mat-card-header>
            <mat-card-title>Stock Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="searchForm" class="search-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Stock Symbol</mat-label>
                <input matInput formControlName="symbol" placeholder="e.g., AAPL, GOOGL" 
                       (input)="onSymbolChange()" [value]="selectedStock?.symbol || ''">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </form>
            
            <div *ngIf="selectedStock" class="stock-details">
              <div class="stock-header">
                <h3>{{ selectedStock.symbol }}</h3>
                <h4>{{ selectedStock.name }}</h4>
              </div>
              
              <div class="stock-metrics">
                <div class="metric">
                  <span class="label">Current Price</span>
                  <span class="value">{{ selectedStock.price | currency }}</span>
                </div>
                <div class="metric">
                  <span class="label">Change</span>
                  <span class="value" [class]="selectedStock.change >= 0 ? 'positive' : 'negative'">
                    {{ selectedStock.change | currency }} ({{ selectedStock.changePercent | number:'1.2-2' }}%)
                  </span>
                </div>
                <div class="metric">
                  <span class="label">Volume</span>
                  <span class="value">{{ selectedStock.volume | number }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Trade Form -->
        <mat-card class="trade-form-card">
          <mat-card-header>
            <mat-card-title>Place Order</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="tradeForm" (ngSubmit)="onSubmit()" class="trade-form">
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Order Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="BUY">Buy</mat-option>
                    <mat-option value="SELL">Sell</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>{{ tradeForm.get('type')?.value === 'BUY' ? 'add_shopping_cart' : 'sell' }}</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Price Type</mat-label>
                  <mat-select formControlName="orderType">
                    <mat-option value="MARKET">Market</mat-option>
                    <mat-option value="LIMIT">Limit</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Quantity</mat-label>
                  <input matInput type="number" formControlName="quantity" 
                         placeholder="Number of shares" min="1" (input)="calculateTotal()">
                  <mat-error *ngIf="tradeForm.get('quantity')?.hasError('required')">
                    Quantity is required
                  </mat-error>
                  <mat-error *ngIf="tradeForm.get('quantity')?.hasError('min')">
                    Quantity must be at least 1
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" 
                               *ngIf="tradeForm.get('orderType')?.value === 'LIMIT'">
                  <mat-label>Price per Share</mat-label>
                  <input matInput type="number" formControlName="price" 
                         placeholder="Price per share" step="0.01" min="0.01" (input)="calculateTotal()">
                  <span matTextPrefix>$</span>
                  <mat-error *ngIf="tradeForm.get('price')?.hasError('required')">
                    Price is required for limit orders
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="order-summary" *ngIf="estimatedTotal > 0">
                <div class="summary-row">
                  <span>Estimated Total:</span>
                  <span class="total-amount">{{ estimatedTotal | currency }}</span>
                </div>
              </div>
              
              <div class="form-actions">
                <button mat-raised-button 
                        [color]="tradeForm.get('type')?.value === 'BUY' ? 'primary' : 'warn'"
                        type="submit" 
                        [disabled]="tradeForm.invalid || !selectedStock"
                        class="trade-button">
                  <mat-icon>{{ tradeForm.get('type')?.value === 'BUY' ? 'add_shopping_cart' : 'sell' }}</mat-icon>
                  {{ tradeForm.get('type')?.value === 'BUY' ? 'Buy' : 'Sell' }} Shares
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .trade-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .trade-header {
      margin-bottom: 32px;
      text-align: center;
    }
    
    .trade-header h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .trade-header p {
      margin: 0;
      color: #666;
    }
    
    .trade-content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .search-form {
      margin-bottom: 24px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .stock-details {
      border-top: 1px solid #e0e0e0;
      padding-top: 24px;
    }
    
    .stock-header h3 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    .stock-header h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 400;
      color: #666;
    }
    
    .stock-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .metric {
      display: flex;
      flex-direction: column;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .metric .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .metric .value {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .metric .value.positive {
      color: #2e7d32;
    }
    
    .metric .value.negative {
      color: #c62828;
    }
    
    .trade-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .order-summary {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #1976d2;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .total-amount {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
    }
    
    .trade-button {
      height: 48px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .trade-container {
        padding: 16px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .stock-metrics {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class TradeComponent implements OnInit {
  searchForm!: FormGroup;
  tradeForm!: FormGroup;
  selectedStock: Stock | null = null;
  estimatedTotal = 0;
  
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
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private stockService: StockService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<AppState>,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.handleRouteParams();
  }

  initializeForms() {
    this.searchForm = this.fb.group({
      symbol: ['']
    });

    this.tradeForm = this.fb.group({
      type: ['BUY', [Validators.required]],
      orderType: ['MARKET', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['']  // Will be required conditionally for LIMIT orders
    });

    // Watch for order type changes to conditionally require price
    this.tradeForm.get('orderType')?.valueChanges.subscribe(orderType => {
      const priceControl = this.tradeForm.get('price');
      if (orderType === 'LIMIT') {
        priceControl?.setValidators([Validators.required, Validators.min(0.01)]);
      } else {
        priceControl?.clearValidators();
      }
      priceControl?.updateValueAndValidity();
      this.calculateTotal();
    });
  }

  handleRouteParams() {
    this.route.queryParams.subscribe(params => {
      if (params['symbol']) {
        this.searchForm.patchValue({ symbol: params['symbol'] });
        this.onSymbolChange();
      }
      if (params['type']) {
        this.tradeForm.patchValue({ type: params['type'] });
      }
    });
  }

  onSymbolChange() {
    const symbol = this.searchForm.get('symbol')?.value?.toUpperCase();
    if (symbol && this.mockStocks[symbol]) {
      this.selectedStock = this.mockStocks[symbol];
      this.calculateTotal();
    } else {
      this.selectedStock = null;
      this.estimatedTotal = 0;
    }
  }

  calculateTotal() {
    if (!this.selectedStock) {
      this.estimatedTotal = 0;
      return;
    }

    const quantity = this.tradeForm.get('quantity')?.value || 0;
    const orderType = this.tradeForm.get('orderType')?.value;
    
    let price: number;
    if (orderType === 'LIMIT') {
      price = this.tradeForm.get('price')?.value || 0;
    } else {
      price = this.selectedStock.price;
    }

    this.estimatedTotal = quantity * price;
  }

  onSubmit() {
    if (this.tradeForm.valid && this.selectedStock) {
      const orderType = this.tradeForm.get('orderType')?.value === 'MARKET' ? 1 : 2;

      // Use selected stock price for MARKET orders, or form price for LIMIT orders
      // Note: In a real application, you would fetch the latest price for MARKET orders
      // Here we assume the selected stock price is already up-to-date
      const price = orderType === 1 ? this.selectedStock.price : this.tradeForm.get('price')?.value;
      
      const tradeOrder: TradeOrder = {
        symbol: this.selectedStock.symbol,
        type: this.tradeForm.get('type')?.value === 'BUY' ? 1 : 2,
        quantity: this.tradeForm.get('quantity')?.value,
        price: price,
        orderType: orderType
      };

      this.openConfirmationDialog(tradeOrder);
    }
  }

  openConfirmationDialog(tradeOrder: TradeOrder) {
    const dialogRef = this.dialog.open(TradeConfirmationDialogComponent, {
      width: '400px',
      data: {
        tradeOrder: tradeOrder,
        stock: this.selectedStock,
        estimatedTotal: this.estimatedTotal
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeTrade(tradeOrder);
      }
    });
  }

  executeTrade(tradeOrder: TradeOrder) {    
    
    this.store.dispatch(PortfolioActions.executeTrade({
      tradeOrder: tradeOrder
    }));
    
    this.snackBar.open(
      `${tradeOrder.type} order for ${tradeOrder.quantity} shares of ${tradeOrder.symbol} has been placed successfully!`,
      'Close',
      { duration: 5000, panelClass: ['success-snackbar'] }
    );

    // Reset form
    this.tradeForm.reset({
      type: 'BUY',
      orderType: 'MARKET'
    });
    this.estimatedTotal = 0;

    this.router.navigate(['/portfolio']);
  }
}