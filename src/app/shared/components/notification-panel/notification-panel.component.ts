import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    RouterModule
  ],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="notificationMenu" 
            [matBadge]="unreadCount$ | async" 
            [matBadgeHidden]="(unreadCount$ | async) === 0"
            matBadgeColor="warn"
            matBadgeSize="small">
      <mat-icon>notifications</mat-icon>
    </button>

    <mat-menu #notificationMenu="matMenu" class="notification-menu" xPosition="before">
      <div class="notification-header" (click)="$event.stopPropagation()">
        <h3>Notifications</h3>
        <div class="header-actions">
          <button mat-icon-button (click)="markAllAsRead()" 
                  [disabled]="(unreadCount$ | async) === 0"
                  matTooltip="Mark all as read">
            <mat-icon>done_all</mat-icon>
          </button>
          <button mat-icon-button (click)="clearAll()" 
                  [disabled]="(notifications$ | async)?.length === 0"
                  matTooltip="Clear all">
            <mat-icon>clear_all</mat-icon>
          </button>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="notification-list" (click)="$event.stopPropagation()">
        <div *ngIf="(notifications$ | async)?.length === 0" class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <p>No notifications</p>
        </div>
        
        <div *ngFor="let notification of notifications$ | async; trackBy: trackByNotificationId" 
             class="notification-item"
             [class.unread]="!notification.read"
             (click)="handleNotificationClick(notification)">
          
          <div class="notification-icon" [class]="notification.type">
            <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ getRelativeTime(notification.timestamp) }}</div>
          </div>
          
          <button mat-icon-button class="remove-button" 
                  (click)="removeNotification($event, notification.id)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [`
    .notification-menu {
      width: 360px;
      max-width: 90vw;
    }
    
    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;
    }
    
    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .header-actions {
      display: flex;
      gap: 4px;
    }
    
    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }
    
    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
      opacity: 0.5;
    }
    
    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
    
    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background-color 0.2s ease;
      position: relative;
    }
    
    .notification-item:hover {
      background-color: #f9f9f9;
    }
    
    .notification-item.unread {
      background-color: #f3f8ff;
      border-left: 3px solid #1976d2;
    }
    
    .notification-item.unread::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 16px;
      width: 6px;
      height: 6px;
      background-color: #1976d2;
      border-radius: 50%;
    }
    
    .notification-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .notification-icon.success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .notification-icon.error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .notification-icon.warning {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .notification-icon.info {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .notification-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .notification-content {
      flex: 1;
      min-width: 0;
    }
    
    .notification-title {
      font-weight: 500;
      font-size: 14px;
      color: #333;
      margin-bottom: 2px;
    }
    
    .notification-message {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
      margin-bottom: 4px;
      word-wrap: break-word;
    }
    
    .notification-time {
      font-size: 11px;
      color: #999;
    }
    
    .remove-button {
      opacity: 0;
      transition: opacity 0.2s ease;
      width: 24px;
      height: 24px;
      margin-left: 8px;
      flex-shrink: 0;
    }
    
    .remove-button mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .notification-item:hover .remove-button {
      opacity: 1;
    }
    
    @media (max-width: 480px) {
      .notification-menu {
        width: 320px;
      }
      
      .notification-header {
        padding: 12px;
      }
      
      .notification-item {
        padding: 10px 12px;
      }
    }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit() {
    // Auto-mark notifications as read after viewing
    this.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      // Router navigation would be handled here
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  removeNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
  }
}