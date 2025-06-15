import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as WatchlistActions from './watchlist.actions';
import { StockService } from '../../core/services/stock.service';

@Injectable()
export class WatchlistEffects {
  
  loadWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.loadWatchlist),
      exhaustMap(() => {
        // Mock watchlist data
        const mockItems = [
          {
            id: '1',
            userId: '1',
            symbol: 'AAPL',
            addedAt: new Date('2024-01-10')
          },
          {
            id: '2',
            userId: '1',
            symbol: 'GOOGL',
            addedAt: new Date('2024-01-12')
          }
        ];
        
        const mockStocks = [
          {
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
          {
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
          }
        ];
        
        return of(WatchlistActions.loadWatchlistSuccess({ 
          items: mockItems, 
          stocks: mockStocks 
        }));
      }),
      catchError(error => 
        of(WatchlistActions.loadWatchlistFailure({ error: error.message }))
      )
    )
  );
  
  addToWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.addToWatchlist),
      exhaustMap(({ symbol }) => {
        // Mock add to watchlist
        const mockItem = {
          id: 'item-' + Date.now(),
          userId: '1',
          symbol,
          addedAt: new Date()
        };
        
        const mockStock = {
          symbol,
          name: `${symbol} Company`,
          price: 100 + Math.random() * 200,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 100000000),
          marketCap: Math.floor(Math.random() * 1000000000000),
          high: 100 + Math.random() * 200,
          low: 100 + Math.random() * 200,
          open: 100 + Math.random() * 200,
          previousClose: 100 + Math.random() * 200
        };
        
        return of(WatchlistActions.addToWatchlistSuccess({ 
          item: mockItem, 
          stock: mockStock 
        }));
      }),
      catchError(error => 
        of(WatchlistActions.addToWatchlistFailure({ error: error.message }))
      )
    )
  );
  
  addToWatchlistSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.addToWatchlistSuccess),
      tap(({ stock }) => {
        this.snackBar.open(
          `${stock.symbol} has been added to your watchlist!`,
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      })
    ),
    { dispatch: false }
  );
  
  removeFromWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.removeFromWatchlist),
      exhaustMap(({ symbol }) => {
        // Mock remove from watchlist
        return of(WatchlistActions.removeFromWatchlistSuccess({ symbol }));
      }),
      catchError(error => 
        of(WatchlistActions.removeFromWatchlistFailure({ error: error.message }))
      )
    )
  );
  
  removeFromWatchlistSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.removeFromWatchlistSuccess),
      tap(({ symbol }) => {
        this.snackBar.open(
          `${symbol} has been removed from your watchlist`,
          'Close',
          { duration: 3000 }
        );
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private stockService: StockService,
    private snackBar: MatSnackBar
  ) {}
}