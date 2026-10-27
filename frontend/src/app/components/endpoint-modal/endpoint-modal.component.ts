import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-endpoint-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdrop($event)">
      <div class="modal-card">
        <header class="modal-header">
          <div>
            <span class="badge">API Configuration</span>
            <h2>Cloud & Local Endpoints</h2>
          </div>
          <button class="close-btn" (click)="close.emit()">&times;</button>
        </header>

        <div class="modal-body">
          <p class="desc">
            Configure which backend API endpoint TaskFlow connects to. By default, production connects to Azure App Service with Aiven MySQL.
          </p>

          <div class="preset-buttons">
            <button 
              type="button" 
              class="preset-card" 
              [class.active]="apiUrl.includes('azurewebsites.net')"
              (click)="usePreset('azure')"
            >
              <div class="preset-badge azure">Production</div>
              <div class="preset-name">Azure App Service (.NET 10 + Aiven MySQL)</div>
              <div class="preset-url">{{ azureUrl }}</div>
            </button>

            <button 
              type="button" 
              class="preset-card" 
              [class.active]="apiUrl.includes('localhost')"
              (click)="usePreset('local')"
            >
              <div class="preset-badge local">Development</div>
              <div class="preset-name">Localhost ASP.NET Web API</div>
              <div class="preset-url">{{ localUrl }}</div>
            </button>
          </div>

          <div class="form-group">
            <label for="custom-api-url">Active API URL</label>
            <input 
              id="custom-api-url" 
              type="text" 
              [(ngModel)]="apiUrl" 
              class="form-control" 
              placeholder="https://..."
            />
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="close.emit()">Cancel</button>
          <button type="button" class="btn btn-primary" (click)="save()">Save & Reconnect</button>
        </footer>
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
    }
    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      width: 100%;
      max-width: 520px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--primary);
      margin-bottom: 4px;
      display: block;
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
      color: var(--text-muted);
      cursor: pointer;
    }
    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
    }
    .preset-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .preset-card {
      padding: 12px 14px;
      background: var(--bg-app);
      border: 2px solid var(--border-subtle);
      border-radius: var(--radius-md);
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .preset-card:hover {
      border-color: var(--border-strong);
      background: var(--bg-surface-hover);
    }
    .preset-card.active {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .preset-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .preset-badge.azure { background: #dbeafe; color: #1e40af; }
    .preset-badge.local { background: #fef3c7; color: #92400e; }
    .preset-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .preset-url {
      font-size: 11px;
      color: var(--text-muted);
      font-family: monospace;
      margin-top: 2px;
      word-break: break-all;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      background: var(--bg-app);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      font-size: 13px;
      font-family: monospace;
      color: var(--text-primary);
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-subtle);
    }
    .btn {
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-secondary {
      background: var(--bg-surface);
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
    }
  `]
})
export class EndpointModalComponent {
  @Input() isOpen = false;
  @Input() currentUrl = '';
  @Output() close = new EventEmitter<void>();
  @Output() urlChanged = new EventEmitter<string>();

  azureUrl = 'https://jay-dotnet-api-demo-2026-dabcfjccbxe9g7ea.centralindia-01.azurewebsites.net/api/tasks';
  localUrl = 'http://localhost:5000/api/tasks';

  apiUrl = '';

  ngOnChanges(): void {
    this.apiUrl = this.currentUrl;
  }

  usePreset(preset: 'azure' | 'local'): void {
    this.apiUrl = preset === 'azure' ? this.azureUrl : this.localUrl;
  }

  save(): void {
    if (this.apiUrl.trim()) {
      this.urlChanged.emit(this.apiUrl.trim());
      this.close.emit();
    }
  }

  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
