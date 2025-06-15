import { createSelector, createFeatureSelector } from '@ngrx/store';
import { PortfolioState } from './portfolio.reducer';

export const selectPortfolioState = createFeatureSelector<PortfolioState>('portfolio');

export const selectPortfolio = createSelector(
  selectPortfolioState,
  (state) => state.portfolio
);

export const selectTradeHistory = createSelector(
  selectPortfolioState,
  (state) => state.tradeHistory
);

export const selectPortfolioLoading = createSelector(
  selectPortfolioState,
  (state) => state.isLoading
);

export const selectPortfolioTrading = createSelector(
  selectPortfolioState,
  (state) => state.isTrading
);

export const selectPortfolioError = createSelector(
  selectPortfolioState,
  (state) => state.error
);

export const selectPortfolioHoldings = createSelector(
  selectPortfolio,
  (portfolio) => portfolio?.holdings || []
);

export const selectPortfolioTotalValue = createSelector(
  selectPortfolio,
  (portfolio) => portfolio?.totalValue || 0
);

export const selectPortfolioGainLoss = createSelector(
  selectPortfolio,
  (portfolio) => ({
    amount: portfolio?.totalGainLoss || 0,
    percentage: portfolio?.totalGainLossPercent || 0
  })
);