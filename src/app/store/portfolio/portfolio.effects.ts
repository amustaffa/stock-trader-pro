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
      return this.stockService.getPortfolio().pipe(
          map(portfolio => PortfolioActions.loadPortfolioSuccess({ portfolio })));
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

         return this.stockService.executeTradeOrder(tradeOrder).pipe(
          map(portfolio => PortfolioActions.executeTradeSuccess({ tradeOrder })));
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
            type: 1, // BUY
            quantity: 50,
            price: 175.20,
            orderType: 1,//'MARKET' as const,
            status: 'EXECUTED' as const,
            createdAt: new Date('2024-01-15T10:30:00')
          },
          {
            id: '2',
            symbol: 'GOOGL',
            type: 2, // SELL
            quantity: 25,
            price: 142.80,
            orderType: 2,//'LIMIT' as const,
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