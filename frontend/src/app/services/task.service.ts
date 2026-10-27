import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { TaskItem, TaskSummary } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);

  // Default to environment configuration, with fallback / toggle ability
  private currentApiUrl = this.getInitialApiUrl();

  get apiUrl(): string {
    return this.currentApiUrl;
  }

  setApiUrl(url: string): void {
    this.currentApiUrl = url;
    localStorage.setItem('taskmanager_api_url', url);
  }

  private getInitialApiUrl(): string {
    const saved = localStorage.getItem('taskmanager_api_url');
    if (saved && saved.trim()) {
      return saved.trim();
    }
    return environment.apiUrl;
  }

  resetToDefaultApiUrl(): void {
    localStorage.removeItem('taskmanager_api_url');
    this.currentApiUrl = environment.apiUrl;
  }

  getTasks(): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(this.currentApiUrl).pipe(
      map((tasks) =>
        (tasks || []).map((t) => this.normalizeTask(t))
      ),
      catchError(this.handleError)
    );
  }

  getTask(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.currentApiUrl}/${id}`).pipe(
      map((task) => this.normalizeTask(task)),
      catchError(this.handleError)
    );
  }

  addTask(task: Partial<TaskItem>): Observable<TaskItem> {
    const payload = {
      title: task.title?.trim(),
      description: task.description?.trim() || null,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      category: task.category?.trim() || 'Other',
      isCompleted: task.isCompleted || false
    };

    return this.http.post<TaskItem>(this.currentApiUrl, payload).pipe(
      map((created) => this.normalizeTask(created)),
      catchError(this.handleError)
    );
  }

  updateTask(task: TaskItem): Observable<TaskItem> {
    const payload = {
      id: task.id,
      title: task.title?.trim(),
      description: task.description?.trim() || null,
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      category: task.category || 'Other',
      isCompleted: task.isCompleted
    };

    return this.http.put<TaskItem>(`${this.currentApiUrl}/${task.id}`, payload).pipe(
      map((res) => (res && res.id ? this.normalizeTask(res) : task)),
      catchError(this.handleError)
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.currentApiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Safe normalization ensuring backward compatibility with earlier Azure endpoints
   * that returned only { id, title, isCompleted } without new fields.
   */
  private normalizeTask(raw: TaskItem): TaskItem {
    return {
      id: raw.id,
      title: raw.title || '',
      description: raw.description || null,
      priority: raw.priority || 'Medium',
      dueDate: raw.dueDate || null,
      category: raw.category || 'Other',
      isCompleted: !!raw.isCompleted,
      createdAt: raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updatedAt || null
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.error instanceof ErrorEvent) {
      // Client-side / network error
      message = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        message = 'Could not connect to the API server. Please check your connection or CORS settings.';
      } else if (error.error && typeof error.error === 'object' && error.error.message) {
        message = error.error.message;
      } else if (typeof error.error === 'string') {
        message = error.error;
      } else {
        message = `API Error (${error.status}): ${error.statusText || 'Request failed'}`;
      }
    }
    return throwError(() => new Error(message));
  }
}
