import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, switchMap } from 'rxjs/operators';

import * as StockActions from './stock.actions';
import { StockService } from '../../core/services/stock.service';

@Injectable()
export class StockEffects {
  
  loadStocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadStocks),
      exhaustMap(() => {
        // Mock data for demo
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
          },
          {
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
          {
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
        ];
        
        return of(StockActions.loadStocksSuccess({ stocks: mockStocks }));
      }),
      catchError(error => 
        of(StockActions.loadStocksFailure({ error: error.message }))
      )
    )
  );
  
  loadStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.loadStock),
      switchMap(({ symbol }) => {
        // Mock single stock load
        const mockStocks: { [key: string]: any } = {
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
          }
        };
        
        const stock = mockStocks[symbol];
        if (stock) {
          return of(StockActions.loadStockSuccess({ stock }));
        } else {
          return of(StockActions.loadStockFailure({ error: 'Stock not found' }));
        }
      }),
      catchError(error => 
        of(StockActions.loadStockFailure({ error: error.message }))
      )
    )
  );
  
  searchStocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StockActions.searchStocks),
      switchMap(({ query }) => {
        // Mock search functionality
        const allStocks = [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 2.34, changePercent: 1.30, volume: 45678900, marketCap: 2800000000000, high: 184.12, low: 179.85, open: 180.22, previousClose: 180.18 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.45, change: -1.87, changePercent: -1.33, volume: 23456789, marketCap: 1750000000000, high: 140.22, low: 137.89, open: 139.45, previousClose: 140.32 }
        ];
        
        const filteredStocks = allStocks.filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
        );
        
        return of(StockActions.searchStocksSuccess({ stocks: filteredStocks }));
      }),
      catchError(error => 
        of(StockActions.searchStocksFailure({ error: error.message }))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private stockService: StockService
  ) {}
}