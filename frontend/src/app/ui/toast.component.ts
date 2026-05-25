import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="toast.type" (click)="toastService.dismiss(toast.id)">
          <span class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✗ }
            @else { ℹ }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 260px;
      font-size: 0.85rem;
      cursor: pointer;
      animation: slideIn 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .toast.success { border-left: 4px solid var(--green); }
    .toast.error { border-left: 4px solid var(--red); }
    .toast.info { border-left: 4px solid var(--blue); }
    .toast-icon { font-weight: bold; font-size: 1.1rem; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}