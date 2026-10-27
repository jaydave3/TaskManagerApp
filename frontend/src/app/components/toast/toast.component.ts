import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage } from '../../models/task.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts.length > 0">
      <div 
        *ngFor="let toast of toasts" 
        class="toast-item" 
        [ngClass]="'toast-' + toast.type"
        role="alert"
      >
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg *ngIf="toast.type === 'error'" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <svg *ngIf="toast.type === 'info'" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="toast-text">{{ toast.message }}</div>
        <button class="toast-close" (click)="dismiss.emit(toast.id)" aria-label="Close notification">
          &times;
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-xl);
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-size: 14px;
    }

    .toast-success {
      border-left: 4px solid var(--success);
    }
    .toast-success .toast-icon {
      color: var(--success);
    }

    .toast-error {
      border-left: 4px solid var(--danger);
    }
    .toast-error .toast-icon {
      color: var(--danger);
    }

    .toast-info {
      border-left: 4px solid var(--primary);
    }
    .toast-info .toast-icon {
      color: var(--primary);
    }

    .toast-icon {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .toast-text {
      flex: 1;
      font-weight: 500;
      line-height: 1.35;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      transition: color var(--transition-fast);
    }
    .toast-close:hover {
      color: var(--text-primary);
    }

    @keyframes slideIn {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent {
  @Input() toasts: ToastMessage[] = [];
  @Output() dismiss = new EventEmitter<string>();
}
