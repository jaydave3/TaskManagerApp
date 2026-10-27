import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { 
  TaskItem, 
  TaskSummary, 
  NavView, 
  SortOption, 
  ToastMessage, 
  PriorityLevel 
} from './models/task.model';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskFormModalComponent } from './components/task-form-modal/task-form-modal.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { ToastComponent } from './components/toast/toast.component';
import { EndpointModalComponent } from './components/endpoint-modal/endpoint-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    DashboardComponent,
    TaskFormModalComponent,
    ConfirmModalComponent,
    ToastComponent,
    EndpointModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private taskService = inject(TaskService);

  // Application State
  tasks = signal<TaskItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Active Navigation & Category
  activeView = signal<NavView>('dashboard');
  activeCategory = signal<string>('Work');
  isMobileSidebarOpen = signal<boolean>(false);

  // Search, Filter & Sort State
  searchQuery = signal<string>('');
  statusFilter = signal<'all' | 'pending' | 'completed' | 'overdue'>('all');
  priorityFilter = signal<string>('all');
  categoryFilter = signal<string>('all');
  sortBy = signal<SortOption>('dueDateAsc');

  // Modals & Dialogs
  isTaskModalOpen = signal<boolean>(false);
  isSavingTask = signal<boolean>(false);
  taskModalError = signal<string>('');
  editingTask = signal<TaskItem | null>(null);

  isDeleteModalOpen = signal<boolean>(false);
  isDeletingTask = signal<boolean>(false);
  deletingTaskItem = signal<TaskItem | null>(null);

  isEndpointModalOpen = signal<boolean>(false);

  // Toast Notifications
  toasts = signal<ToastMessage[]>([]);

  // Theme State
  isDarkMode = signal<boolean>(false);

  // Current API URL
  currentApiUrl = signal<string>(this.taskService.apiUrl);

  // Computed Summaries & Metrics
  summary = computed<TaskSummary>(() => {
    const list = this.tasks();
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let dueToday = 0;
    let highPriority = 0;

    for (const t of list) {
      if (t.isCompleted) {
        completed++;
      } else {
        pending++;
        if (t.priority === 'High') {
          highPriority++;
        }
        if (t.dueDate) {
          const due = new Date(t.dueDate);
          const dueStr = due.toISOString().substring(0, 10);
          if (dueStr === todayStr) {
            dueToday++;
          } else if (due.getTime() < now.getTime()) {
            overdue++;
          }
        }
      }
    }

    return {
      total: list.length,
      pending,
      completed,
      overdue,
      dueToday,
      highPriority
    };
  });

  priorityCounts = computed(() => {
    const list = this.tasks();
    return {
      high: list.filter(t => !t.isCompleted && t.priority === 'High').length,
      medium: list.filter(t => !t.isCompleted && t.priority === 'Medium').length,
      low: list.filter(t => !t.isCompleted && t.priority === 'Low').length
    };
  });

  categoryCounts = computed(() => {
    const list = this.tasks();
    return {
      work: list.filter(t => t.category === 'Work').length,
      personal: list.filter(t => t.category === 'Personal').length,
      learning: list.filter(t => t.category === 'Learning').length,
      other: list.filter(t => t.category === 'Other' || !t.category).length
    };
  });

  urgentTasks = computed(() => {
    const list = this.tasks();
    const now = new Date();
    return list.filter(t => {
      if (t.isCompleted || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      // Overdue or due within 24 hours
      return due.getTime() < now.getTime() + 24 * 60 * 60 * 1000;
    }).slice(0, 5);
  });

  // Filtered and Sorted Tasks for the List View
  filteredTasks = computed<TaskItem[]>(() => {
    let list = [...this.tasks()];
    const view = this.activeView();
    const cat = this.activeCategory();
    const query = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const prio = this.priorityFilter();
    const catFilter = this.categoryFilter();
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    // 1. Navigation View Filtering
    if (view === 'my-day') {
      list = list.filter(t => {
        if (!t.dueDate) {
          const createdStr = t.createdAt ? new Date(t.createdAt).toISOString().substring(0, 10) : '';
          return createdStr === todayStr;
        }
        return new Date(t.dueDate).toISOString().substring(0, 10) === todayStr;
      });
    } else if (view === 'upcoming') {
      list = list.filter(t => {
        if (t.isCompleted || !t.dueDate) return false;
        return new Date(t.dueDate).getTime() >= now.getTime();
      });
    } else if (view === 'completed') {
      list = list.filter(t => t.isCompleted);
    } else if (view === 'categories') {
      list = list.filter(t => (t.category || 'Other') === cat);
    }

    // 2. Search Text
    if (query) {
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
      );
    }

    // 3. Status Filter Toolbar
    if (status === 'pending') {
      list = list.filter(t => !t.isCompleted);
    } else if (status === 'completed') {
      list = list.filter(t => t.isCompleted);
    } else if (status === 'overdue') {
      list = list.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() < now.getTime());
    }

    // 4. Priority Filter Toolbar
    if (prio !== 'all') {
      list = list.filter(t => t.priority === prio);
    }

    // 5. Category Filter Toolbar (if on All view)
    if (catFilter !== 'all' && view !== 'categories') {
      list = list.filter(t => (t.category || 'Other') === catFilter);
    }

    // 6. Sorting
    const sort = this.sortBy();
    list.sort((a, b) => {
      if (sort === 'dueDateAsc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sort === 'dueDateDesc') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (sort === 'priorityDesc') {
        const weights: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        const wA = weights[a.priority || 'Medium'] || 2;
        const wB = weights[b.priority || 'Medium'] || 2;
        return wB - wA;
      }
      if (sort === 'createdDesc') {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      }
      if (sort === 'titleAsc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return list;
  });

  hasActiveFilters = computed<boolean>(() => {
    return (
      this.searchQuery().trim().length > 0 ||
      this.statusFilter() !== 'all' ||
      this.priorityFilter() !== 'all' ||
      this.categoryFilter() !== 'all'
    );
  });

  ngOnInit(): void {
    this.initTheme();
    this.loadTasks();
  }

  // --- THEME ---
  private initTheme(): void {
    const saved = localStorage.getItem('taskmanager_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.isDarkMode.set(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }

  toggleTheme(): void {
    const next = !this.isDarkMode();
    this.isDarkMode.set(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('taskmanager_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('taskmanager_theme', 'light');
    }
  }

  // --- API OPERATIONS ---
  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Could not load tasks from API.');
        this.showToast('error', 'Failed to retrieve tasks from the API.');
      }
    });
  }

  handleCreateTask(payload: Partial<TaskItem>): void {
    this.isSavingTask.set(true);
    this.taskModalError.set('');

    this.taskService.addTask(payload).subscribe({
      next: (created) => {
        this.tasks.update(curr => [created, ...curr]);
        this.isSavingTask.set(false);
        this.isTaskModalOpen.set(false);
        this.showToast('success', `Task "${created.title}" created successfully!`);
      },
      error: (err) => {
        this.isSavingTask.set(false);
        this.taskModalError.set(err.message || 'Failed to create task.');
      }
    });
  }

  handleUpdateTask(payload: Partial<TaskItem>): void {
    if (!payload.id) return;
    this.isSavingTask.set(true);
    this.taskModalError.set('');

    const fullTask: TaskItem = {
      id: payload.id,
      title: payload.title || '',
      description: payload.description,
      priority: payload.priority as PriorityLevel || 'Medium',
      dueDate: payload.dueDate,
      category: payload.category || 'Work',
      isCompleted: !!payload.isCompleted
    };

    this.taskService.updateTask(fullTask).subscribe({
      next: (updated) => {
        const saved = (updated && updated.id) ? updated : fullTask;
        this.tasks.update(curr => curr.map(t => t.id === saved.id ? { ...t, ...saved } : t));
        this.isSavingTask.set(false);
        this.isTaskModalOpen.set(false);
        this.showToast('success', 'Task updated successfully.');
      },
      error: (err) => {
        this.isSavingTask.set(false);
        this.taskModalError.set(err.message || 'Failed to update task.');
      }
    });
  }

  onSaveTaskModal(payload: Partial<TaskItem>): void {
    if (this.editingTask()) {
      this.handleUpdateTask(payload);
    } else {
      this.handleCreateTask(payload);
    }
  }

  toggleTaskCompletion(task: TaskItem): void {
    const updatedStatus = !task.isCompleted;
    const previous = { ...task };
    
    // Optimistic UI update
    this.tasks.update(curr => curr.map(t => t.id === task.id ? { ...t, isCompleted: updatedStatus } : t));

    const taskToSend: TaskItem = {
      ...task,
      isCompleted: updatedStatus
    };

    this.taskService.updateTask(taskToSend).subscribe({
      next: () => {
        const msg = updatedStatus 
          ? `Completed "${task.title}"` 
          : `Reopened "${task.title}"`;
        this.showToast('info', msg);
      },
      error: (err) => {
        // Rollback
        this.tasks.update(curr => curr.map(t => t.id === task.id ? previous : t));
        this.showToast('error', `Failed to update status: ${err.message}`);
      }
    });
  }

  openCreateModal(): void {
    this.editingTask.set(null);
    this.taskModalError.set('');
    this.isTaskModalOpen.set(true);
  }

  openEditModal(task: TaskItem): void {
    this.editingTask.set({ ...task });
    this.taskModalError.set('');
    this.isTaskModalOpen.set(true);
  }

  promptDeleteTask(task: TaskItem): void {
    this.deletingTaskItem.set(task);
    this.isDeleteModalOpen.set(true);
  }

  confirmDeleteTask(): void {
    const item = this.deletingTaskItem();
    if (!item || item.id === undefined) return;

    this.isDeletingTask.set(true);
    this.taskService.deleteTask(item.id).subscribe({
      next: () => {
        this.tasks.update(curr => curr.filter(t => t.id !== item.id));
        this.isDeletingTask.set(false);
        this.isDeleteModalOpen.set(false);
        this.showToast('info', `Deleted "${item.title}"`);
        this.deletingTaskItem.set(null);
      },
      error: (err) => {
        this.isDeletingTask.set(false);
        this.showToast('error', `Failed to delete task: ${err.message}`);
      }
    });
  }

  // --- FILTER CONTROLS ---
  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
    this.categoryFilter.set('all');
  }

  // --- API ENDPOINT MODAL ---
  onApiUrlChanged(newUrl: string): void {
    this.taskService.setApiUrl(newUrl);
    this.currentApiUrl.set(newUrl);
    this.showToast('info', `Switched endpoint to: ${newUrl}`);
    this.loadTasks();
  }

  // --- TOASTS ---
  showToast(type: 'success' | 'error' | 'info', message: string): void {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const toast: ToastMessage = { id, type, message };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  // --- HELPERS ---
  isOverdue(task: TaskItem): boolean {
    if (task.isCompleted || !task.dueDate) return false;
    return new Date(task.dueDate).getTime() < new Date().getTime();
  }

  isDueToday(task: TaskItem): boolean {
    if (!task.dueDate) return false;
    const dueStr = new Date(task.dueDate).toISOString().substring(0, 10);
    const todayStr = new Date().toISOString().substring(0, 10);
    return dueStr === todayStr;
  }

  getViewTitle(): string {
    const view = this.activeView();
    if (view === 'dashboard') return 'Overview & Analytics';
    if (view === 'all') return 'All Tasks';
    if (view === 'my-day') return 'My Day';
    if (view === 'upcoming') return 'Upcoming Tasks';
    if (view === 'completed') return 'Completed Tasks';
    if (view === 'categories') return `${this.activeCategory()} Tasks`;
    return 'Task Manager';
  }

  getViewSubtitle(): string {
    const view = this.activeView();
    if (view === 'dashboard') return 'Review productivity metrics and upcoming priorities.';
    if (view === 'all') return 'Manage, prioritize, and track all your tasks.';
    if (view === 'my-day') return 'Tasks scheduled or created for today.';
    if (view === 'upcoming') return 'Tasks with upcoming target deadlines.';
    if (view === 'completed') return 'Archive of finished and resolved action items.';
    if (view === 'categories') return `Filtered by category: ${this.activeCategory()}`;
    return '';
  }
}
