import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './services/task.service';
import { TaskItem } from './models/task.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private taskService = inject(TaskService);

  tasks: TaskItem[] = [];
  newTaskTitle = '';
  errorMessage = '';
  isLoading = false;

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Could not connect to .NET API. Please ensure the backend is running at http://localhost:5000.';
        this.isLoading = false;
      }
    });
  }

  addTask(): void {
    const trimmed = this.newTaskTitle.trim();
    if (!trimmed) return;

    const newTask: TaskItem = { title: trimmed, isCompleted: false };
    this.taskService.addTask(newTask).subscribe({
      next: (created) => {
        this.tasks.push(created);
        this.newTaskTitle = '';
      },
      error: () => {
        this.errorMessage = 'Failed to add task.';
      }
    });
  }

  toggleTask(task: TaskItem): void {
    this.taskService.updateTask(task).subscribe({
      error: () => {
        this.errorMessage = 'Failed to update task.';
      }
    });
  }

  deleteTask(id: number | undefined): void {
    if (id === undefined) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== id);
      },
      error: () => {
        this.errorMessage = 'Failed to delete task.';
      }
    });
  }
}
