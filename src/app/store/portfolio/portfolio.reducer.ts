import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Portfolio } from "../../core/models/Portfolio";
import { TradeOrder } from "../../core/models/TradeOrder";
import * as PortfolioActions from './portfolio.actions';

export interface PortfolioState {
  portfolio: Portfolio | null;
  tradeHistory: TradeOrder[];
  isLoading: boolean;
  isTrading: boolean;
  error: string | null;
}

export const initialState: PortfolioState = {
  portfolio: null,
  tradeHistory: [],
  isLoading: false,
  isTrading: false,
  error: null
};

export const portfolioReducer = createReducer(
  initialState,
  
  // Load Portfolio
  on(PortfolioActions.loadPortfolio, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(PortfolioActions.loadPortfolioSuccess, (state, { portfolio }) => ({
    ...state,
    portfolio,
    isLoading: false,
    error: null
  })),
  
  on(PortfolioActions.loadPortfolioFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Execute Trade
  on(PortfolioActions.executeTrade, (state) => ({
    ...state,
    isTrading: true,
    error: null
  })),
  
  on(PortfolioActions.executeTradeSuccess, (state, { tradeOrder }) => ({
    ...state,
    tradeHistory: [tradeOrder, ...state.tradeHistory],
    isTrading: false,
    error: null
  })),
  
  on(PortfolioActions.executeTradeFailure, (state, { error }) => ({
    ...state,
    isTrading: false,
    error
  })),
  
  // Load Trade History
  on(PortfolioActions.loadTradeHistory, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(PortfolioActions.loadTradeHistorySuccess, (state, { trades }) => ({
    ...state,
    tradeHistory: trades,
    isLoading: false,
    error: null
  })),
  
  on(PortfolioActions.loadTradeHistoryFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  }))
);