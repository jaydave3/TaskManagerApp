import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItem, TaskSummary } from '../../models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Header -->
      <div class="dashboard-hero">
        <div>
          <h2>Productivity Dashboard</h2>
          <p class="hero-subtitle">Real-time task tracking, progress metrics, and upcoming priorities.</p>
        </div>
        <button class="btn btn-primary" (click)="createTask.emit()">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>New Task</span>
        </button>
      </div>

      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <!-- Total Tasks -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Total Tasks</span>
            <div class="stat-icon total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ summary.total }}</div>
          <div class="stat-subtext">Across all categories</div>
        </div>

        <!-- Pending Tasks -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Pending</span>
            <div class="stat-icon pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div class="stat-value">{{ summary.pending }}</div>
          <div class="stat-subtext">{{ summary.highPriority }} high priority</div>
        </div>

        <!-- Completed Tasks & Progress -->
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Completed</span>
            <div class="stat-icon completed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="stat-value">
            {{ summary.completed }} 
            <span class="completion-rate">({{ completionPercentage }}%)</span>
          </div>
          <!-- Progress Bar -->
          <div class="progress-bar-track">
            <div class="progress-bar-fill" [style.width.%]="completionPercentage"></div>
          </div>
        </div>

        <!-- Overdue Tasks -->
        <div class="stat-card" [class.alert-card]="summary.overdue > 0">
          <div class="stat-header">
            <span class="stat-label">Overdue</span>
            <div class="stat-icon overdue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="stat-value" [class.overdue-text]="summary.overdue > 0">{{ summary.overdue }}</div>
          <div class="stat-subtext" *ngIf="summary.overdue > 0">Requires attention</div>
          <div class="stat-subtext" *ngIf="summary.overdue === 0">All deadlines met!</div>
        </div>
      </div>

      <!-- Analytics Breakdown Row -->
      <div class="analytics-row">
        <!-- Priority Breakdown -->
        <div class="analytics-card">
          <div class="card-title">Priority Breakdown</div>
          <div class="priority-list">
            <div class="priority-row">
              <div class="priority-name">
                <span class="dot high"></span> High Priority
              </div>
              <div class="priority-count">{{ priorityCounts.high }}</div>
            </div>
            <div class="priority-row">
              <div class="priority-name">
                <span class="dot medium"></span> Medium Priority
              </div>
              <div class="priority-count">{{ priorityCounts.medium }}</div>
            </div>
            <div class="priority-row">
              <div class="priority-name">
                <span class="dot low"></span> Low Priority
              </div>
              <div class="priority-count">{{ priorityCounts.low }}</div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="analytics-card">
          <div class="card-title">Category Distribution</div>
          <div class="category-grid">
            <div class="category-chip work">
              <span class="chip-icon">💼</span>
              <span class="chip-label">Work</span>
              <span class="chip-count">{{ categoryCounts.work }}</span>
            </div>
            <div class="category-chip personal">
              <span class="chip-icon">🏠</span>
              <span class="chip-label">Personal</span>
              <span class="chip-count">{{ categoryCounts.personal }}</span>
            </div>
            <div class="category-chip learning">
              <span class="chip-icon">📚</span>
              <span class="chip-label">Learning</span>
              <span class="chip-count">{{ categoryCounts.learning }}</span>
            </div>
            <div class="category-chip other">
              <span class="chip-icon">📁</span>
              <span class="chip-label">Other</span>
              <span class="chip-count">{{ categoryCounts.other }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Urgent / Due Soon Section -->
      <div class="attention-section" *ngIf="urgentTasks.length > 0">
        <div class="section-header">
          <h3>⚡ Needs Attention (Overdue & Due Soon)</h3>
          <button class="view-all-link" (click)="viewAll.emit()">View all tasks &rarr;</button>
        </div>
        <div class="urgent-list">
          <div *ngFor="let task of urgentTasks" class="urgent-item">
            <div class="urgent-info">
              <span class="urgent-title">{{ task.title }}</span>
              <div class="urgent-meta">
                <span class="badge priority-{{ task.priority | lowercase }}">{{ task.priority }}</span>
                <span class="badge category-badge">{{ task.category }}</span>
                <span *ngIf="task.dueDate" class="due-tag">
                  Due: {{ task.dueDate | date:'mediumDate' }}
                </span>
              </div>
            </div>
            <div class="urgent-actions">
              <button class="btn btn-sm btn-outline" (click)="toggleTask.emit(task)">
                Mark Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dashboard-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 8px;
    }

    .dashboard-hero h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hero-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    .stat-card.alert-card {
      border-color: var(--danger-border);
      background: var(--danger-light);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon.total { background: var(--primary-light); color: var(--primary); }
    .stat-icon.pending { background: var(--warning-light); color: var(--warning); }
    .stat-icon.completed { background: var(--success-light); color: var(--success); }
    .stat-icon.overdue { background: var(--danger-light); color: var(--danger); }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
    }
    .stat-value.overdue-text {
      color: var(--danger);
    }

    .completion-rate {
      font-size: 16px;
      font-weight: 600;
      color: var(--success);
      margin-left: 4px;
    }

    .stat-subtext {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 8px;
    }

    .progress-bar-track {
      width: 100%;
      height: 6px;
      background: var(--bg-muted);
      border-radius: var(--radius-full);
      margin-top: 10px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--success);
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
    }

    .analytics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .analytics-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .priority-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .priority-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--bg-app);
      border-radius: var(--radius-md);
      font-size: 14px;
    }

    .priority-name {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-primary);
      font-weight: 500;
    }

    .priority-name .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .priority-name .dot.high { background: var(--danger); }
    .priority-name .dot.medium { background: var(--warning); }
    .priority-name .dot.low { background: var(--success); }

    .priority-count {
      font-weight: 700;
      color: var(--text-primary);
    }

    .category-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .category-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
    }
    .category-chip.work { background: var(--badge-work); color: var(--badge-work-text); }
    .category-chip.personal { background: var(--badge-personal); color: var(--badge-personal-text); }
    .category-chip.learning { background: var(--badge-learning); color: var(--badge-learning-text); }
    .category-chip.other { background: var(--badge-other); color: var(--badge-other-text); }

    .chip-label { flex: 1; }
    .chip-count { font-weight: 700; }

    .attention-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .view-all-link {
      background: transparent;
      border: none;
      color: var(--primary);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }

    .urgent-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .urgent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      background: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
    }

    .urgent-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .urgent-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      text-transform: capitalize;
    }
    .badge.priority-high { background: var(--danger-light); color: var(--danger); }
    .badge.priority-medium { background: var(--warning-light); color: var(--warning); }
    .badge.priority-low { background: var(--success-light); color: var(--success); }
    .badge.category-badge { background: var(--bg-muted); color: var(--text-secondary); }

    .due-tag {
      font-size: 12px;
      color: var(--danger);
      font-weight: 600;
    }

    .btn {
      padding: 10px 16px;
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
    .btn-primary { background: var(--primary); color: #ffffff; }
    .btn-primary:hover { background: var(--primary-hover); }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }
    .btn-outline {
      background: var(--bg-surface);
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }
    .btn-outline:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }
  `]
})
export class DashboardComponent {
  @Input() summary: TaskSummary = {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0
  };

  @Input() priorityCounts = { high: 0, medium: 0, low: 0 };
  @Input() categoryCounts = { work: 0, personal: 0, learning: 0, other: 0 };
  @Input() urgentTasks: TaskItem[] = [];

  @Output() createTask = new EventEmitter<void>();
  @Output() viewAll = new EventEmitter<void>();
  @Output() toggleTask = new EventEmitter<TaskItem>();

  get completionPercentage(): number {
    if (!this.summary.total) return 0;
    return Math.round((this.summary.completed / this.summary.total) * 100);
  }
}
