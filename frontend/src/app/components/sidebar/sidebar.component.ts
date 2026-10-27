import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavView, TaskSummary } from '../../models/task.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Mobile Backdrop -->
    <div class="sidebar-backdrop" *ngIf="isMobileOpen" (click)="closeMobile.emit()"></div>

    <aside class="sidebar" [class.mobile-open]="isMobileOpen">
      <!-- App Brand -->
      <div class="brand">
        <div class="brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div class="brand-info">
          <span class="brand-title">TaskFlow</span>
          <span class="brand-tag">Enterprise SaaS</span>
        </div>
        <button class="mobile-close-btn" (click)="closeMobile.emit()" aria-label="Close menu">
          &times;
        </button>
      </div>

      <!-- Quick Action: New Task -->
      <div class="sidebar-action">
        <button class="btn-create-task" (click)="createTask.emit()">
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>Create Task</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="nav-menu">
        <div class="nav-section-label">MAIN VIEWS</div>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'dashboard'"
          (click)="selectView('dashboard')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          <span class="nav-text">Dashboard</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'all'"
          (click)="selectView('all')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span class="nav-text">All Tasks</span>
          <span class="nav-count">{{ summary.total }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'my-day'"
          (click)="selectView('my-day')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
          </svg>
          <span class="nav-text">My Day</span>
          <span class="nav-count" *ngIf="summary.dueToday > 0">{{ summary.dueToday }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'upcoming'"
          (click)="selectView('upcoming')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span class="nav-text">Upcoming</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'completed'"
          (click)="selectView('completed')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="nav-text">Completed</span>
          <span class="nav-count">{{ summary.completed }}</span>
        </button>

        <div class="nav-section-label">CATEGORIES</div>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'categories' && activeCategory === 'Work'"
          (click)="selectCategory('Work')"
        >
          <span class="cat-bullet work"></span>
          <span class="nav-text">Work</span>
          <span class="nav-count">{{ categoryCounts.work }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'categories' && activeCategory === 'Personal'"
          (click)="selectCategory('Personal')"
        >
          <span class="cat-bullet personal"></span>
          <span class="nav-text">Personal</span>
          <span class="nav-count">{{ categoryCounts.personal }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'categories' && activeCategory === 'Learning'"
          (click)="selectCategory('Learning')"
        >
          <span class="cat-bullet learning"></span>
          <span class="nav-text">Learning</span>
          <span class="nav-count">{{ categoryCounts.learning }}</span>
        </button>

        <button 
          class="nav-item" 
          [class.active]="activeView === 'categories' && activeCategory === 'Other'"
          (click)="selectCategory('Other')"
        >
          <span class="cat-bullet other"></span>
          <span class="nav-text">Other</span>
          <span class="nav-count">{{ categoryCounts.other }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer: Environment / API Status -->
      <div class="sidebar-footer">
        <div class="api-status-card" (click)="openEndpointModal.emit()">
          <div class="status-indicator-dot" [class.live]="isLiveAzure"></div>
          <div class="status-details">
            <span class="status-title">{{ isLiveAzure ? 'Azure Cloud API' : 'Local Dev API' }}</span>
            <span class="status-url">{{ apiBaseShort }}</span>
          </div>
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" class="settings-icon">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
    }

    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      transition: transform var(--transition-normal);
      z-index: 999;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--primary);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .brand-title {
      font-size: 17px;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.3px;
    }

    .brand-tag {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .mobile-close-btn {
      display: none;
      background: transparent;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
    }

    .sidebar-action {
      padding: 16px 16px 8px;
    }

    .btn-create-task {
      width: 100%;
      padding: 11px 16px;
      background: var(--primary);
      color: #ffffff;
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background-color var(--transition-fast), transform var(--transition-fast);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    .btn-create-task:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }

    .nav-menu {
      flex: 1;
      padding: 8px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.8px;
      padding: 12px 12px 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 9px 12px;
      border: none;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-fast);
    }
    .nav-item:hover {
      background: var(--bg-surface-hover);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 700;
    }

    .nav-text {
      flex: 1;
    }

    .nav-count {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      background: var(--bg-muted);
      color: var(--text-secondary);
    }
    .nav-item.active .nav-count {
      background: var(--primary);
      color: #ffffff;
    }

    .cat-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .cat-bullet.work { background: #3b82f6; }
    .cat-bullet.personal { background: #a855f7; }
    .cat-bullet.learning { background: #14b8a6; }
    .cat-bullet.other { background: #64748b; }

    .sidebar-footer {
      padding: 12px 16px 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .api-status-card {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: var(--bg-app);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: border-color var(--transition-fast), background var(--transition-fast);
    }
    .api-status-card:hover {
      border-color: var(--border-strong);
      background: var(--bg-surface-hover);
    }

    .status-indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--warning);
      box-shadow: 0 0 6px var(--warning);
    }
    .status-indicator-dot.live {
      background: var(--success);
      box-shadow: 0 0 6px var(--success);
    }

    .status-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .status-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .status-url {
      font-size: 10px;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .settings-icon {
      color: var(--text-muted);
    }

    /* Mobile Responsive */
    @media (max-width: 900px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      .mobile-close-btn {
        display: block;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() activeView: NavView = 'dashboard';
  @Input() activeCategory: string = 'Work';
  @Input() summary: TaskSummary = {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0
  };
  @Input() categoryCounts = { work: 0, personal: 0, learning: 0, other: 0 };
  @Input() currentApiUrl = '';
  @Input() isMobileOpen = false;

  @Output() viewChange = new EventEmitter<NavView>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() createTask = new EventEmitter<void>();
  @Output() openEndpointModal = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  get isLiveAzure(): boolean {
    return this.currentApiUrl.includes('azurewebsites.net');
  }

  get apiBaseShort(): string {
    if (this.currentApiUrl.includes('azurewebsites.net')) {
      return 'Azure App Service';
    }
    if (this.currentApiUrl.includes('localhost:5000')) {
      return 'localhost:5000';
    }
    return this.currentApiUrl;
  }

  selectView(view: NavView): void {
    this.viewChange.emit(view);
    this.closeMobile.emit();
  }

  selectCategory(category: string): void {
    this.categoryChange.emit(category);
    this.viewChange.emit('categories');
    this.closeMobile.emit();
  }
}
