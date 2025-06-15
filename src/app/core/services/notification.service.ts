import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show a toast notification
   */
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000): void {
    const panelClass = [`${type}-snackbar`];
    
    this.snackBar.open(message, 'Close', {
      duration,
      panelClass,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  /**
   * Add a persistent notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);

    // Also show as toast
    this.showToast(notification.message, notification.type);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount(updatedNotifications);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  /**
   * Handle real-time stock price alerts
   */
  handleStockPriceAlert(symbol: string, currentPrice: number, targetPrice: number, type: 'above' | 'below'): void {
    const message = `${symbol} has ${type === 'above' ? 'risen above' : 'fallen below'} $${targetPrice.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}`;
    
    this.addNotification({
      type: type === 'above' ? 'success' : 'warning',
      title: 'Price Alert',
      message,
      actionUrl: `/trade?symbol=${symbol}`
    });
  }

  /**
   * Handle trade execution notifications
   */
  handleTradeExecution(symbol: string, type: 'BUY' | 'SELL', quantity: number, price: number): void {
    const message = `${type} order executed: ${quantity} shares of ${symbol} at $${price.toFixed(2)}`;
    
    this.addNotification({
      type: 'success',
      title: 'Trade Executed',
      message,
      actionUrl: '/portfolio'
    });
  }

  /**
   * Handle portfolio milestone notifications
   */
  handlePortfolioMilestone(milestone: string, value: number): void {
    this.addNotification({
      type: 'info',
      title: 'Portfolio Milestone',
      message: `${milestone}: $${value.toLocaleString()}`,
      actionUrl: '/portfolio'
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }
}