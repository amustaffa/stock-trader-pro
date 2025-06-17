import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';

import { environment } from '../../../environments/environment';
import { AppState } from '../../store/app.reducer';
import * as StockActions from '../../store/stock/stock.actions';
import * as PortfolioActions from '../../store/portfolio/portfolio.actions';
import { Stock } from '../models/stock.model';
import { Portfolio } from "../models/Portfolio";
import { TradeOrder } from "../models/TradeOrder";

export interface RealTimeUpdate {
  type: 'STOCK_PRICE' | 'TRADE_EXECUTED' | 'PORTFOLIO_UPDATE' | 'MARKET_NEWS';
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection | null = null;
  private connectionStateSubject = new BehaviorSubject<'Connected' | 'Disconnected' | 'Connecting' | 'Error'>('Disconnected');
  private realTimeUpdatesSubject = new Subject<RealTimeUpdate>();
  
  public connectionState$ = this.connectionStateSubject.asObservable();
  public realTimeUpdates$ = this.realTimeUpdatesSubject.asObservable();

  constructor(private store: Store<AppState>) {}

  /**
   * Initialize SignalR connection
   */
  public async startConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      return;
    }

    this.connectionStateSubject.next('Connecting');

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${environment.signalRUrl}/signalr`, {
          withCredentials: false,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(environment.production ? LogLevel.Warning : LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start the connection
      await this.hubConnection.start();
      
      this.connectionStateSubject.next('Connected');
      console.log('SignalR connection established');

      // Join user-specific groups
      await this.joinUserGroups();

    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStateSubject.next('Error');
      throw error;
    }
  }

  /**
   * Stop SignalR connection
   */
  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        this.connectionStateSubject.next('Disconnected');
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  /**
   * Subscribe to stock price updates
   */
  public async subscribeToStock(symbol: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SubscribeToStock', symbol);
        console.log(`Subscribed to ${symbol} price updates`);
      } catch (error) {
        console.error(`Error subscribing to ${symbol}:`, error);
      }
    }
  }

  /**
   * Unsubscribe from stock price updates
   */
  public async unsubscribeFromStock(symbol: string): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('UnsubscribeFromStock', symbol);
        console.log(`Unsubscribed from ${symbol} price updates`);
      } catch (error) {
        console.error(`Error unsubscribing from ${symbol}:`, error);
      }
    }
  }

  /**
   * Subscribe to portfolio updates
   */
  public async subscribeToPortfolio(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('SubscribeToPortfolio');
        console.log('Subscribed to portfolio updates');
      } catch (error) {
        console.error('Error subscribing to portfolio updates:', error);
      }
    }
  }
  
  /**
   * Send trade order to server
   */
  public async sendTradeOrder(tradeOrder: TradeOrder): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        await this.hubConnection.invoke('ExecuteTrade', tradeOrder);
        console.log('Trade order sent via SignalR');
      } catch (error) {
        console.error('Error sending trade order:', error);
        throw error;
      }
    } else {
      throw new Error('SignalR connection not established');
    }
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  /**
   * Setup event handlers for SignalR messages
   */
  private setupEventHandlers(): void {
    if (!this.hubConnection) return;

      // Stock price updates
    this.hubConnection.on('receivemessage', (message: string) => {
      console.log('Received message -:', message);
    });

    // Stock price updates
    this.hubConnection.on('StockPriceUpdate', (stockUpdate: Stock) => {
      console.log('Received stock price update:', stockUpdate);
      
      // Update store with new stock data
      this.store.dispatch(StockActions.loadStockSuccess({ stock: stockUpdate }));
      
      // Emit real-time update
      this.realTimeUpdatesSubject.next({
        type: 'STOCK_PRICE',
        data: stockUpdate,
        timestamp: new Date()
      });
    });

    // Trade execution updates
    this.hubConnection.on('TradeExecuted', (tradeResult: TradeOrder) => {
      console.log('Trade executed:', tradeResult);
      
      // Update store with executed trade
      this.store.dispatch(PortfolioActions.executeTradeSuccess({ tradeOrder: tradeResult }));
      
      // Emit real-time update
      this.realTimeUpdatesSubject.next({
        type: 'TRADE_EXECUTED',
        data: tradeResult,
        timestamp: new Date()
      });
    });

    // Portfolio updates
    this.hubConnection.on('PortfolioUpdate', (portfolio: Portfolio) => {
      console.log('Portfolio updated:', portfolio);
      
      // Update store with new portfolio data
      this.store.dispatch(PortfolioActions.loadPortfolioSuccess({ portfolio }));
      
      // Emit real-time update
      this.realTimeUpdatesSubject.next({
        type: 'PORTFOLIO_UPDATE',
        data: portfolio,
        timestamp: new Date()
      });
    });

    // Market news updates
    this.hubConnection.on('MarketNews', (news: any) => {
      console.log('Market news received:', news);
      
      // Emit real-time update
      this.realTimeUpdatesSubject.next({
        type: 'MARKET_NEWS',
        data: news,
        timestamp: new Date()
      });
    });

    // Connection state changes
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionStateSubject.next('Connecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionStateSubject.next('Connected');
      this.joinUserGroups(); // Rejoin groups after reconnection
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR connection closed');
      this.connectionStateSubject.next('Disconnected');
    });
  }

  /**
   * Join user-specific SignalR groups
   */
  private async joinUserGroups(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      try {
        const userId = JSON.parse(localStorage.getItem('current_user') || '{}').id;
        if (userId) {
          await this.hubConnection.invoke('JoinUserGroup', userId);
          console.log(`Joined user group: ${userId}`);
        }
      } catch (error) {
        console.error('Error joining user groups:', error);
      }
    }
  }

  /**
   * Simulate real-time stock price updates for demo
   */
  public startMockPriceUpdates(): void {
    const mockStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
    
    setInterval(() => {
      const randomStock = mockStocks[Math.floor(Math.random() * mockStocks.length)];
      const basePrice = this.getBasePriceForStock(randomStock);
      const priceChange = (Math.random() - 0.5) * 5; // Random change between -2.5 and +2.5
      const newPrice = Math.max(basePrice + priceChange, 1); // Ensure price doesn't go below $1
      const changePercent = (priceChange / basePrice) * 100;
      
      const mockUpdate: Stock = {
        symbol: randomStock,
        name: this.getStockName(randomStock),
        price: Number(newPrice.toFixed(2)),
        change: Number(priceChange.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
        high: Number((newPrice + Math.random() * 5).toFixed(2)),
        low: Number((newPrice - Math.random() * 5).toFixed(2)),
        open: Number((newPrice + (Math.random() - 0.5) * 3).toFixed(2)),
        previousClose: Number((newPrice - priceChange).toFixed(2))
      };

      // Simulate receiving update via SignalR
      this.store.dispatch(StockActions.loadStockSuccess({ stock: mockUpdate }));
      
      this.realTimeUpdatesSubject.next({
        type: 'STOCK_PRICE',
        data: mockUpdate,
        timestamp: new Date()
      });
    }, 3000); // Update every 3 seconds
  }

  private getBasePriceForStock(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'AAPL': 182.52,
      'GOOGL': 138.45,
      'MSFT': 378.90,
      'TSLA': 248.73,
      'AMZN': 155.89
    };
    return basePrices[symbol] || 100;
  }

  private getStockName(symbol: string): string {
    const names: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla, Inc.',
      'AMZN': 'Amazon.com Inc.'
    };
    return names[symbol] || `${symbol} Company`;
  }
}