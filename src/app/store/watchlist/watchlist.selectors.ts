import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WatchlistState, selectAll } from './watchlist.reducer';

export const selectWatchlistState = createFeatureSelector<WatchlistState>('watchlist');

export const selectAllWatchlistItems = createSelector(
  selectWatchlistState,
  selectAll
);

export const selectWatchlistStocks = createSelector(
  selectWatchlistState,
  (state) => state.watchlistStocks
);

export const selectWatchlistStocksArray = createSelector(
  selectWatchlistStocks,
  (stocksMap) => Object.values(stocksMap)
);

export const selectWatchlistLoading = createSelector(
  selectWatchlistState,
  (state) => state.isLoading
);

export const selectWatchlistError = createSelector(
  selectWatchlistState,
  (state) => state.error
);

export const selectIsInWatchlist = (symbol: string) => createSelector(
  selectWatchlistStocks,
  (stocksMap) => !!stocksMap[symbol]
);