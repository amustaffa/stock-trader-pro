import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { Stock, Portfolio, TradeOrder, WatchlistItem } from '../models/stock.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private watchlistSubject = new BehaviorSubject<WatchlistItem[]>([]);

  constructor(private http: HttpClient) {}

  // Stock data
  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${environment.apiUrl}/stocks`);
  }

  getStock(symbol: string): Observable<Stock> {
    return this.http.get<Stock>(`${environment.apiUrl}/stocks/${symbol}`);
  }

  searchStocks(query: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${environment.apiUrl}/stocks/search?q=${query}`);
  }

  // Portfolio
  getPortfolio(): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${environment.apiUrl}/portfolios`);
  }

  // Trading
  executeTradeOrder(order: TradeOrder): Observable<TradeOrder> {
    return this.http.post<TradeOrder>(`${environment.apiUrl}/trades`, order);
  }

  getTradeHistory(): Observable<TradeOrder[]> {
    return this.http.get<TradeOrder[]>(`${environment.apiUrl}/trades/history`);
  }

  // Watchlist
  getWatchlist(): Observable<WatchlistItem[]> {
    const watchlist = this.http.get<WatchlistItem[]>(`${environment.apiUrl}/watchlist`);
    watchlist.subscribe(items => this.watchlistSubject.next(items));
    return watchlist;
  }

  addToWatchlist(symbol: string): Observable<WatchlistItem> {
    return this.http.post<WatchlistItem>(`${environment.apiUrl}/watchlist`, { symbol });
  }

  removeFromWatchlist(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/watchlist/${id}`);
  }

  watchlist$ = this.watchlistSubject.asObservable();
}