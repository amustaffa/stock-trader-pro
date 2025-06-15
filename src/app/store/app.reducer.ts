import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { stockReducer, StockState } from './stock/stock.reducer';
import { portfolioReducer, PortfolioState } from './portfolio/portfolio.reducer';
import { watchlistReducer, WatchlistState } from './watchlist/watchlist.reducer';

export interface AppState {
  auth: AuthState;
  stocks: StockState;
  portfolio: PortfolioState;
  watchlist: WatchlistState;
}

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  stocks: stockReducer,
  portfolio: portfolioReducer,
  watchlist: watchlistReducer
};