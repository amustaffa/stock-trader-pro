import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Stock, TradeOrder } from '../../core/models/stock.model';

interface DialogData {
  tradeOrder: TradeOrder;
  stock: Stock;
  estimatedTotal: number;
}

@Component({
  selector: 'app-trade-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirmation-dialog">
      <h2 mat-dialog-title>
        <mat-icon [color]="data.tradeOrder.type === 'BUY' ? 'primary' : 'warn'">
          {{ data.tradeOrder.type === 'BUY' ? 'add_shopping_cart' : 'sell' }}
        </mat-icon>
        Confirm {{ data.tradeOrder.type }} Order
      </h2>
      
      <mat-dialog-content>
        <div class="order-details">
          <div class="detail-row">
            <span class="label">Stock:</span>
            <span class="value">{{ data.stock.symbol }} - {{ data.stock.name }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Order Type:</span>
            <span class="value">{{ data.tradeOrder.type }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Quantity:</span>
            <span class="value">{{ data.tradeOrder.quantity }} shares</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Price Type:</span>
            <span class="value">{{ data.tradeOrder.orderType }}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Price per Share:</span>
            <span class="value">{{ data.tradeOrder.price | currency }}</span>
          </div>
          
          <div class="detail-row total-row">
            <span class="label">Estimated Total:</span>
            <span class="value total">{{ data.estimatedTotal | currency }}</span>
          </div>
        </div>
        
        <div class="warning-message">
          <mat-icon color="warn">warning</mat-icon>
          <p>Please review your order carefully. This action cannot be undone.</p>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button 
                [color]="data.tradeOrder.type === 'BUY' ? 'primary' : 'warn'"
                (click)="onConfirm()">
          Confirm {{ data.tradeOrder.type }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirmation-dialog h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-weight: 500;
    }
    
    .order-details {
      margin: 24px 0;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-row .label {
      font-weight: 500;
      color: #666;
    }
    
    .detail-row .value {
      font-weight: 500;
      color: #333;
    }
    
    .total-row {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #e0e0e0;
      border-bottom: none;
    }
    
    .total-row .total {
      font-size: 18px;
      font-weight: 600;
      color: #1976d2;
    }
    
    .warning-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background-color: #fff3e0;
      border-radius: 8px;
      margin-top: 16px;
    }
    
    .warning-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .warning-message p {
      margin: 0;
      font-size: 14px;
      color: #f57c00;
    }
    
    mat-dialog-actions {
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class TradeConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TradeConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}