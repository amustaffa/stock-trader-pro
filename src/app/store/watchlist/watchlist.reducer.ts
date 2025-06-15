import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { WatchlistItem, Stock } from '../../core/models/stock.model';
import * as WatchlistActions from './watchlist.actions';

export interface WatchlistState extends EntityState<WatchlistItem> {
  watchlistStocks: { [symbol: string]: Stock };
  isLoading: boolean;
  error: string | null;
}

export const adapter: EntityAdapter<WatchlistItem> = createEntityAdapter<WatchlistItem>({
  selectId: (item: WatchlistItem) => item.symbol
});

export const initialState: WatchlistState = adapter.getInitialState({
  watchlistStocks: {},
  isLoading: false,
  error: null
});

export const watchlistReducer = createReducer(
  initialState,
  
  // Load Watchlist
  on(WatchlistActions.loadWatchlist, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WatchlistActions.loadWatchlistSuccess, (state, { items, stocks }) => {
    const stocksMap = stocks.reduce((acc, stock) => {
      acc[stock.symbol] = stock;
      return acc;
    }, {} as { [symbol: string]: Stock });
    
    return adapter.setAll(items, {
      ...state,
      watchlistStocks: stocksMap,
      isLoading: false,
      error: null
    });
  }),
  
  on(WatchlistActions.loadWatchlistFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Add to Watchlist
  on(WatchlistActions.addToWatchlist, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WatchlistActions.addToWatchlistSuccess, (state, { item, stock }) =>
    adapter.addOne(item, {
      ...state,
      watchlistStocks: {
        ...state.watchlistStocks,
        [stock.symbol]: stock
      },
      isLoading: false,
      error: null
    })
  ),
  
  on(WatchlistActions.addToWatchlistFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Remove from Watchlist
  on(WatchlistActions.removeFromWatchlist, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WatchlistActions.removeFromWatchlistSuccess, (state, { symbol }) => {
    const { [symbol]: removed, ...remainingStocks } = state.watchlistStocks;
    
    return adapter.removeOne(symbol, {
      ...state,
      watchlistStocks: remainingStocks,
      isLoading: false,
      error: null
    });
  }),
  
  on(WatchlistActions.removeFromWatchlistFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal
} = adapter.getSelectors();