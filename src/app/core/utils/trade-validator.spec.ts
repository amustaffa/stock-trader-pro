import { TradeValidator } from './trade-validator';
import { TradeOrder } from '../models/TradeOrder';

describe('TradeValidator', () => {
  let validTradeOrder: TradeOrder;

  beforeEach(() => {
    validTradeOrder = {
      symbol: 'AAPL',
      type: 1,
      quantity: 100,
      price: 150.50,
      orderType: 1,
      status: 'PENDING'
    };
  });

  it('should validate a correct trade order', () => {
    expect(TradeValidator.validateTradeOrder(validTradeOrder)).toBeTruthy();
  });

  it('should reject invalid symbol', () => {
    const invalidOrder = { ...validTradeOrder, symbol: '' };
    expect(TradeValidator.validateTradeOrder(invalidOrder)).toBeFalsy();
  });

  it('should reject invalid type', () => {
    const invalidOrder = { ...validTradeOrder, type: 3 };
    expect(TradeValidator.validateTradeOrder(invalidOrder)).toBeFalsy();
  });

  it('should reject negative quantity', () => {
    const invalidOrder = { ...validTradeOrder, quantity: -1 };
    expect(TradeValidator.validateTradeOrder(invalidOrder)).toBeFalsy();
  });

  it('should reject invalid status', () => {
    const invalidOrder = { ...validTradeOrder, status: 'INVALID' as any };
    expect(TradeValidator.validateTradeOrder(invalidOrder)).toBeFalsy();
  });
});