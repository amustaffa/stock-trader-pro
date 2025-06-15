import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SignalRService } from '../../../core/services/signalr.service';

@Component({
  selector: 'app-real-time-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <div class="real-time-indicator" 
         [class]="getStatusClass()"
         [matTooltip]="getTooltipText()">
      <mat-icon class="status-icon">
        {{ getStatusIcon() }}
      </mat-icon>
      <span class="status-text">{{ getStatusText() }}</span>
      <div class="pulse-dot" *ngIf="connectionState === 'Connected'"></div>
    </div>
  `,
  styles: [`
    .real-time-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }
    
    .real-time-indicator.connected {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
    
    .real-time-indicator.connecting {
      background-color: #fff3e0;
      color: #f57c00;
    }
    
    .real-time-indicator.disconnected {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .real-time-indicator.error {
      background-color: #ffebee;
      color: #c62828;
    }
    
    .status-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .status-text {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .pulse-dot {
      width: 6px;
      height: 6px;
      background-color: #2e7d32;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7);
      }
      
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(46, 125, 50, 0);
      }
      
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(46, 125, 50, 0);
      }
    }
    
    @media (max-width: 768px) {
      .status-text {
        display: none;
      }
    }
  `]
})
export class RealTimeIndicatorComponent implements OnInit, OnDestroy {
  connectionState: 'Connected' | 'Disconnected' | 'Connecting' | 'Error' = 'Disconnected';
  private destroy$ = new Subject<void>();

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.signalRService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.connectionState = state;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(): string {
    return this.connectionState.toLowerCase();
  }

  getStatusIcon(): string {
    switch (this.connectionState) {
      case 'Connected':
        return 'wifi';
      case 'Connecting':
        return 'wifi_find';
      case 'Disconnected':
        return 'wifi_off';
      case 'Error':
        return 'error';
      default:
        return 'wifi_off';
    }
  }

  getStatusText(): string {
    switch (this.connectionState) {
      case 'Connected':
        return 'Live';
      case 'Connecting':
        return 'Connecting';
      case 'Disconnected':
        return 'Offline';
      case 'Error':
        return 'Error';
      default:
        return 'Offline';
    }
  }

  getTooltipText(): string {
    switch (this.connectionState) {
      case 'Connected':
        return 'Real-time data connection active';
      case 'Connecting':
        return 'Connecting to real-time data...';
      case 'Disconnected':
        return 'Real-time data connection offline';
      case 'Error':
        return 'Real-time data connection error';
      default:
        return 'Real-time data status unknown';
    }
  }
}