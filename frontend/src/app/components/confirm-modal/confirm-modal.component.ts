import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <div class="modal-icon danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <div class="modal-content">
          <h3 id="confirm-modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div *ngIf="itemTitle" class="item-highlight">
            "{{ itemTitle }}"
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" (click)="cancel.emit()">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" [disabled]="isProcessing" (click)="confirm.emit()">
            <span *ngIf="isProcessing" class="spinner"></span>
            <span>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 440px;
      padding: 24px;
      text-align: center;
      animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-icon {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .modal-icon.danger {
      background: var(--danger-light);
      color: var(--danger);
      border: 1px solid var(--danger-border);
    }

    .modal-content h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .modal-message {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .item-highlight {
      margin-top: 10px;
      padding: 8px 12px;
      background: var(--bg-app);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 14px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }

    .btn-secondary {
      background: var(--bg-surface);
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }
    .btn-secondary:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .btn-danger {
      background: var(--danger);
      color: #ffffff;
    }
    .btn-danger:hover:not(:disabled) {
      background: var(--danger-hover);
    }
    .btn-danger:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this action?';
  @Input() itemTitle = '';
  @Input() confirmText = 'Delete';
  @Input() isProcessing = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isProcessing) {
      this.cancel.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.isProcessing) {
      this.cancel.emit();
    }
  }
}
