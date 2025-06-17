
export interface TradeOrder {
  id?: string;
  symbol: string;
  type: number; // 1 for BUY, 2 for SELL
  quantity: number;
  price: number;
  orderType: number; // 1 for MARKET, 2 for LIMIT
  status?: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  createdAt?: Date;
}
