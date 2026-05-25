import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  toasts = this.toastsSignal.asReadonly();
  private nextId = 0;

  show(message: string, type: ToastMessage['type'] = 'info') {
    const id = this.nextId++;
    this.toastsSignal.update(arr => [...arr, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: number) {
    this.toastsSignal.update(arr => arr.filter(t => t.id !== id));
  }
}