import { createAction, props } from '@ngrx/store';
import { Portfolio } from "../../core/models/Portfolio";
import { TradeOrder } from "../../core/models/TradeOrder";

// Load Portfolio
export const loadPortfolio = createAction('[Portfolio] Load Portfolio');

export const loadPortfolioSuccess = createAction(
  '[Portfolio] Load Portfolio Success',
  props<{ portfolio: Portfolio }>()
);

export const loadPortfolioFailure = createAction(
  '[Portfolio] Load Portfolio Failure',
  props<{ error: string }>()
);

// Execute Trade
export const executeTrade = createAction(
  '[Portfolio] Execute Trade',
  props<{ tradeOrder: TradeOrder }>()
);

export const executeTradeSuccess = createAction(
  '[Portfolio] Execute Trade Success',
  props<{ tradeOrder: TradeOrder }>()
);

export const executeTradeFailure = createAction(
  '[Portfolio] Execute Trade Failure',
  props<{ error: string }>()
);

// Load Trade History
export const loadTradeHistory = createAction('[Portfolio] Load Trade History');

export const loadTradeHistorySuccess = createAction(
  '[Portfolio] Load Trade History Success',
  props<{ trades: TradeOrder[] }>()
);

export const loadTradeHistoryFailure = createAction(
  '[Portfolio] Load Trade History Failure',
  props<{ error: string }>()
);