import { createAction, props } from '@ngrx/store';
import { Stock } from '../../core/models/stock.model';

// Load Stocks
export const loadStocks = createAction('[Stock] Load Stocks');

export const loadStocksSuccess = createAction(
  '[Stock] Load Stocks Success',
  props<{ stocks: Stock[] }>()
);

export const loadStocksFailure = createAction(
  '[Stock] Load Stocks Failure',
  props<{ error: string }>()
);

// Load Single Stock
export const loadStock = createAction(
  '[Stock] Load Stock',
  props<{ symbol: string }>()
);

export const loadStockSuccess = createAction(
  '[Stock] Load Stock Success',
  props<{ stock: Stock }>()
);

export const loadStockFailure = createAction(
  '[Stock] Load Stock Failure',
  props<{ error: string }>()
);

// Search Stocks
export const searchStocks = createAction(
  '[Stock] Search Stocks',
  props<{ query: string }>()
);

export const searchStocksSuccess = createAction(
  '[Stock] Search Stocks Success',
  props<{ stocks: Stock[] }>()
);

export const searchStocksFailure = createAction(
  '[Stock] Search Stocks Failure',
  props<{ error: string }>()
);

// Clear Search
export const clearSearch = createAction('[Stock] Clear Search');

// Set Selected Stock
export const setSelectedStock = createAction(
  '[Stock] Set Selected Stock',
  props<{ stock: Stock | null }>()
);