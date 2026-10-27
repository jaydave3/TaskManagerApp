import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriorityLevel, TaskCategory, TaskItem } from '../../models/task.model';

@Component({
  selector: 'app-task-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <header class="modal-header">
          <div>
            <span class="modal-badge">{{ isEditing ? 'Edit Task' : 'New Task' }}</span>
            <h2 id="task-form-title">{{ isEditing ? 'Update Task Details' : 'Create New Task' }}</h2>
          </div>
          <button type="button" class="close-btn" (click)="onCancel()" aria-label="Close dialog">
            &times;
          </button>
        </header>

        <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="modal-body">
          <div *ngIf="errorMessage" class="error-banner">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Title Field -->
          <div class="form-group">
            <label for="task-title">
              Task Title <span class="required">*</span>
            </label>
            <input
              #titleInput
              id="task-title"
              type="text"
              name="title"
              [(ngModel)]="formData.title"
              placeholder="e.g., Deploy backend service to Azure"
              required
              maxlength="255"
              class="form-control"
              [class.is-invalid]="titleTouched && !formData.title?.trim()"
              (blur)="titleTouched = true"
            />
            <div *ngIf="titleTouched && !formData.title?.trim()" class="field-error">
              Task title is required.
            </div>
          </div>

          <!-- Description Field -->
          <div class="form-group">
            <label for="task-desc">
              Description <span class="optional">(Optional)</span>
            </label>
            <textarea
              id="task-desc"
              name="description"
              [(ngModel)]="formData.description"
              placeholder="Add key notes, context, or checklist items..."
              rows="3"
              maxlength="2000"
              class="form-control textarea"
            ></textarea>
          </div>

          <!-- Priority Selector -->
          <div class="form-group">
            <label>Priority Level</label>
            <div class="priority-segmented">
              <button
                type="button"
                class="priority-btn low"
                [class.selected]="formData.priority === 'Low'"
                (click)="formData.priority = 'Low'"
              >
                <span class="dot"></span> Low
              </button>
              <button
                type="button"
                class="priority-btn medium"
                [class.selected]="formData.priority === 'Medium'"
                (click)="formData.priority = 'Medium'"
              >
                <span class="dot"></span> Medium
              </button>
              <button
                type="button"
                class="priority-btn high"
                [class.selected]="formData.priority === 'High'"
                (click)="formData.priority = 'High'"
              >
                <span class="dot"></span> High
              </button>
            </div>
          </div>

          <!-- Category & Due Date Row -->
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="task-category">Category</label>
              <select
                id="task-category"
                name="category"
                [(ngModel)]="formData.category"
                class="form-control select"
              >
                <option value="Work">💼 Work</option>
                <option value="Personal">🏠 Personal</option>
                <option value="Learning">📚 Learning</option>
                <option value="Other">📁 Other</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label for="task-due-date">Due Date <span class="optional">(Optional)</span></label>
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                [(ngModel)]="dueDateFormatted"
                class="form-control"
              />
            </div>
          </div>

          <!-- Status toggle for Editing -->
          <div class="form-group checkbox-group" *ngIf="isEditing">
            <label class="custom-checkbox-label">
              <input
                type="checkbox"
                name="isCompleted"
                [(ngModel)]="formData.isCompleted"
              />
              <span class="checkbox-box"></span>
              <span class="label-text">Mark this task as completed</span>
            </label>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()" [disabled]="isSaving">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSaving || !formData.title?.trim()"
            >
              <span *ngIf="isSaving" class="spinner"></span>
              <span>{{ isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task') }}</span>
            </button>
          </footer>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
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
      max-width: 520px;
      overflow: hidden;
      animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .modal-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .modal-header h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      line-height: 1;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: var(--radius-sm);
      padding: 2px 6px;
      transition: color var(--transition-fast), background var(--transition-fast);
    }
    .close-btn:hover {
      color: var(--text-primary);
      background: var(--bg-surface-hover);
    }

    .modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--danger-light);
      border: 1px solid var(--danger-border);
      color: var(--danger);
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }
    .flex-1 {
      flex: 1;
    }

    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .required {
      color: var(--danger);
    }

    .optional {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: normal;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
      background: var(--bg-app);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 14px;
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }
    .form-control:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-focus);
      background: var(--bg-surface);
    }
    .form-control.is-invalid {
      border-color: var(--danger);
    }

    .textarea {
      resize: vertical;
      min-height: 72px;
    }

    .field-error {
      font-size: 12px;
      color: var(--danger);
      margin-top: 2px;
    }

    .priority-segmented {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
    }

    .priority-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-app);
      color: var(--text-secondary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .priority-btn .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .priority-btn.low .dot { background: var(--success); }
    .priority-btn.medium .dot { background: var(--warning); }
    .priority-btn.high .dot { background: var(--danger); }

    .priority-btn:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .priority-btn.selected.low {
      background: var(--success-light);
      border-color: var(--success);
      color: var(--success);
    }
    .priority-btn.selected.medium {
      background: var(--warning-light);
      border-color: var(--warning);
      color: var(--warning);
    }
    .priority-btn.selected.high {
      background: var(--danger-light);
      border-color: var(--danger);
      color: var(--danger);
    }

    .custom-checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      padding: 8px 0;
    }
    .custom-checkbox-label input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary);
      cursor: pointer;
    }
    .label-text {
      font-size: 14px;
      color: var(--text-primary);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border-subtle);
      margin-top: 6px;
    }

    .btn {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-fast);
      border: 1px solid transparent;
    }

    .btn-secondary {
      background: var(--bg-surface);
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }
    .btn-secondary:hover:not(:disabled) {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .btn-primary {
      background: var(--primary);
      color: #ffffff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--primary-hover);
    }
    .btn:disabled {
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
      from { transform: scale(0.97); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class TaskFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() initialTask: TaskItem | null = null;
  @Input() isSaving = false;
  @Input() errorMessage = '';

  @Output() save = new EventEmitter<Partial<TaskItem>>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('titleInput') titleInputElement?: ElementRef<HTMLInputElement>;

  isEditing = false;
  titleTouched = false;
  dueDateFormatted = '';

  formData: Partial<TaskItem> = {
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Work',
    dueDate: null,
    isCompleted: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.titleTouched = false;
      if (this.initialTask) {
        this.isEditing = true;
        this.formData = {
          id: this.initialTask.id,
          title: this.initialTask.title,
          description: this.initialTask.description || '',
          priority: this.initialTask.priority || 'Medium',
          category: this.initialTask.category || 'Work',
          isCompleted: this.initialTask.isCompleted,
          dueDate: this.initialTask.dueDate
        };
        this.dueDateFormatted = this.initialTask.dueDate ? this.initialTask.dueDate.substring(0, 10) : '';
      } else {
        this.isEditing = false;
        this.formData = {
          title: '',
          description: '',
          priority: 'Medium',
          category: 'Work',
          dueDate: null,
          isCompleted: false
        };
        this.dueDateFormatted = '';
      }

      setTimeout(() => {
        this.titleInputElement?.nativeElement.focus();
      }, 100);
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.isSaving) {
      this.onCancel();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop') && !this.isSaving) {
      this.onCancel();
    }
  }

  onSubmit(): void {
    const trimmedTitle = this.formData.title?.trim();
    if (!trimmedTitle) {
      this.titleTouched = true;
      return;
    }

    const payload: Partial<TaskItem> = {
      ...this.formData,
      title: trimmedTitle,
      dueDate: this.dueDateFormatted ? new Date(this.dueDateFormatted).toISOString() : null
    };

    this.save.emit(payload);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
