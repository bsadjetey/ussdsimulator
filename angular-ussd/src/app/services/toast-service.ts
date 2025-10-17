import { Injectable } from '@angular/core';

declare const bootstrap: any;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private container: HTMLElement | null = null;

  constructor() {
    // Create a toast container if not present
    this.ensureContainer();
  }

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3';
      this.container.style.zIndex = '1080'; // above modals
      document.body.appendChild(this.container);
    }
  }

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success') {
    this.ensureContainer();

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0 shadow`;
    toastEl.role = 'alert';
    toastEl.ariaLive = 'assertive';
    toastEl.ariaAtomic = 'true';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;

    this.container!.appendChild(toastEl);

    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();

    // Auto-remove after hidden
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }
}
