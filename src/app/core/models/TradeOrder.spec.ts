import { TradeOrder } from './TradeOrder';

describe('TradeOrder', () => {
  let mockTradeOrder: TradeOrder;

  beforeEach(() => {
    mockTradeOrder = {
      id: '123',
      symbol: 'AAPL',
      type: 1, // BUY
      quantity: 100,
      price: 150.50,
      orderType: 1, // MARKET
      status: 'PENDING',
      createdAt: new Date()
    };
  });

  it('should create a valid trade order', () => {
    expect(mockTradeOrder).toBeDefined();
    expect(mockTradeOrder.symbol).toBe('AAPL');
    expect(mockTradeOrder.type).toBe(1);
    expect(mockTradeOrder.quantity).toBe(100);
    expect(mockTradeOrder.price).toBe(150.50);
    expect(mockTradeOrder.orderType).toBe(1);
    expect(mockTradeOrder.status).toBe('PENDING');
  });

  it('should validate trade order type', () => {
    expect([1, 2]).toContain(mockTradeOrder.type);
  });

  it('should validate order type', () => {
    expect([1, 2]).toContain(mockTradeOrder.orderType);
  });

  it('should validate status', () => {
    const validStatuses: Array<'PENDING' | 'EXECUTED' | 'CANCELLED'> = ['PENDING', 'EXECUTED', 'CANCELLED'];
    expect(validStatuses).toContain(mockTradeOrder.status as 'PENDING' | 'EXECUTED' | 'CANCELLED');
  });
});