import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Stock } from '../../core/models/stock.model';
import * as StockActions from './stock.actions';

export interface StockState extends EntityState<Stock> {
  selectedStock: Stock | null;
  searchResults: Stock[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<Stock> = createEntityAdapter<Stock>({
  selectId: (stock: Stock) => stock.symbol
});

export const initialState: StockState = adapter.getInitialState({
  selectedStock: null,
  searchResults: [],
  isLoading: false,
  isSearching: false,
  error: null
});

export const stockReducer = createReducer(
  initialState,
  
  // Load Stocks
  on(StockActions.loadStocks, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(StockActions.loadStocksSuccess, (state, { stocks }) =>
    adapter.setAll(stocks, {
      ...state,
      isLoading: false,
      error: null
    })
  ),
  
  on(StockActions.loadStocksFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Load Single Stock
  on(StockActions.loadStock, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(StockActions.loadStockSuccess, (state, { stock }) =>
    adapter.upsertOne(stock, {
      ...state,
      selectedStock: stock,
      isLoading: false,
      error: null
    })
  ),
  
  on(StockActions.loadStockFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Search Stocks
  on(StockActions.searchStocks, (state) => ({
    ...state,
    isSearching: true,
    error: null
  })),
  
  on(StockActions.searchStocksSuccess, (state, { stocks }) => ({
    ...state,
    searchResults: stocks,
    isSearching: false,
    error: null
  })),
  
  on(StockActions.searchStocksFailure, (state, { error }) => ({
    ...state,
    isSearching: false,
    error
  })),
  
  // Clear Search
  on(StockActions.clearSearch, (state) => ({
    ...state,
    searchResults: []
  })),
  
  // Set Selected Stock
  on(StockActions.setSelectedStock, (state, { stock }) => ({
    ...state,
    selectedStock: stock
  }))
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();