import { TradeOrder } from '../models/TradeOrder';

export class TradeValidator {
  static validateTradeOrder(order: TradeOrder): boolean {
    if (!order.symbol || order.symbol.trim().length === 0) return false;
    if (![1, 2].includes(order.type)) return false;
    if (order.quantity <= 0) return false;
    if (order.price <= 0) return false;
    if (![1, 2].includes(order.orderType)) return false;
    if (order.status && !['PENDING', 'EXECUTED', 'CANCELLED'].includes(order.status)) return false;
    return true;
  }
}