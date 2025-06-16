export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  createdDate: Date;
  lastUpdated: Date;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  items: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface TradeOrder {
  id?: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderType: 'MARKET' | 'LIMIT';
  status?: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  createdAt?: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  addedAt: Date;
}