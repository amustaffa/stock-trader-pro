import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as PortfolioActions from './portfolio.actions';
import { StockService } from '../../core/services/stock.service';

@Injectable()
export class PortfolioEffects {
  
  loadPortfolio$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.loadPortfolio),
      exhaustMap(() => {
        // Mock portfolio data
        const mockPortfolio = {
          id: '1',
          userId: '1',
          totalValue: 125000,
          totalGainLoss: 8500,
          totalGainLossPercent: 7.29,
          holdings: [
            {
              id: '1',
              symbol: 'AAPL',
              quantity: 100,
              averagePrice: 150.00,
              currentPrice: 182.52,
              totalValue: 18252,
              gainLoss: 3252,
              gainLossPercent: 21.68
            },
            {
              id: '2',
              symbol: 'GOOGL',
              quantity: 50,
              averagePrice: 120.00,
              currentPrice: 138.45,
              totalValue: 6922.50,
              gainLoss: 922.50,
              gainLossPercent: 15.38
            }
          ]
        };
        
        return of(PortfolioActions.loadPortfolioSuccess({ portfolio: mockPortfolio }));
      }),
      catchError(error => 
        of(PortfolioActions.loadPortfolioFailure({ error: error.message }))
      )
    )
  );
  
  executeTrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.executeTrade),
      exhaustMap(({ tradeOrder }) => {
        // Simulate trade execution
        const executedTrade = {
          ...tradeOrder,
          id: 'trade-' + Date.now(),
          status: 'EXECUTED' as const,
          createdAt: new Date()
        };
        
        return of(PortfolioActions.executeTradeSuccess({ tradeOrder: executedTrade }));
      }),
      catchError(error => 
        of(PortfolioActions.executeTradeFailure({ error: error.message }))
      )
    )
  );
  
  executeTradeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.executeTradeSuccess),
      tap(({ tradeOrder }) => {
        this.snackBar.open(
          `${tradeOrder.type} order for ${tradeOrder.quantity} shares of ${tradeOrder.symbol} executed successfully!`,
          'Close',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );
      })
    ),
    { dispatch: false }
  );
  
  loadTradeHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.loadTradeHistory),
      exhaustMap(() => {
        // Mock trade history
        const mockTrades = [
          {
            id: '1',
            symbol: 'AAPL',
            type: 'BUY' as const,
            quantity: 50,
            price: 175.20,
            orderType: 'MARKET' as const,
            status: 'EXECUTED' as const,
            createdAt: new Date('2024-01-15T10:30:00')
          },
          {
            id: '2',
            symbol: 'GOOGL',
            type: 'SELL' as const,
            quantity: 25,
            price: 142.80,
            orderType: 'LIMIT' as const,
            status: 'EXECUTED' as const,
            createdAt: new Date('2024-01-14T14:15:00')
          }
        ];
        
        return of(PortfolioActions.loadTradeHistorySuccess({ trades: mockTrades }));
      }),
      catchError(error => 
        of(PortfolioActions.loadTradeHistoryFailure({ error: error.message }))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {}
}