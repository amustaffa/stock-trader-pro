import { createSelector, createFeatureSelector } from '@ngrx/store';
import { StockState, selectAll, selectEntities } from './stock.reducer';

export const selectStockState = createFeatureSelector<StockState>('stocks');

export const selectAllStocks = createSelector(
  selectStockState,
  selectAll
);

export const selectStockEntities = createSelector(
  selectStockState,
  selectEntities
);

export const selectSelectedStock = createSelector(
  selectStockState,
  (state) => state.selectedStock
);

export const selectSearchResults = createSelector(
  selectStockState,
  (state) => state.searchResults
);

export const selectStocksLoading = createSelector(
  selectStockState,
  (state) => state.isLoading
);

export const selectStocksSearching = createSelector(
  selectStockState,
  (state) => state.isSearching
);

export const selectStocksError = createSelector(
  selectStockState,
  (state) => state.error
);

export const selectStockBySymbol = (symbol: string) => createSelector(
  selectStockEntities,
  (entities) => entities[symbol]
);