export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type TaskCategory = 'Work' | 'Personal' | 'Learning' | 'Other';

export interface TaskItem {
  id?: number;
  title: string;
  description?: string | null;
  priority?: PriorityLevel;
  dueDate?: string | null;
  category?: TaskCategory | string | null;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  dueToday: number;
  highPriority: number;
}

export type NavView = 'dashboard' | 'all' | 'my-day' | 'upcoming' | 'completed' | 'categories';
export type SortOption = 'dueDateAsc' | 'dueDateDesc' | 'priorityDesc' | 'createdDesc' | 'titleAsc';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
