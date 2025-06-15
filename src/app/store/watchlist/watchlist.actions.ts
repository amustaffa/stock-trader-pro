import { createAction, props } from '@ngrx/store';
import { WatchlistItem, Stock } from '../../core/models/stock.model';

// Load Watchlist
export const loadWatchlist = createAction('[Watchlist] Load Watchlist');

export const loadWatchlistSuccess = createAction(
  '[Watchlist] Load Watchlist Success',
  props<{ items: WatchlistItem[], stocks: Stock[] }>()
);

export const loadWatchlistFailure = createAction(
  '[Watchlist] Load Watchlist Failure',
  props<{ error: string }>()
);

// Add to Watchlist
export const addToWatchlist = createAction(
  '[Watchlist] Add to Watchlist',
  props<{ symbol: string }>()
);

export const addToWatchlistSuccess = createAction(
  '[Watchlist] Add to Watchlist Success',
  props<{ item: WatchlistItem, stock: Stock }>()
);

export const addToWatchlistFailure = createAction(
  '[Watchlist] Add to Watchlist Failure',
  props<{ error: string }>()
);

// Remove from Watchlist
export const removeFromWatchlist = createAction(
  '[Watchlist] Remove from Watchlist',
  props<{ symbol: string }>()
);

export const removeFromWatchlistSuccess = createAction(
  '[Watchlist] Remove from Watchlist Success',
  props<{ symbol: string }>()
);

export const removeFromWatchlistFailure = createAction(
  '[Watchlist] Remove from Watchlist Failure',
  props<{ error: string }>()
);