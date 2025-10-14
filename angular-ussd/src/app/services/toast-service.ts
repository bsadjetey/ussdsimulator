import { Injectable } from '@angular/core';

declare const bootstrap : any;

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string, type: 'success' | 'danger' = 'success') {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    toastEl.role = 'alert';
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
    document.body.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl);
    bsToast.show();
    setTimeout(() => document.body.removeChild(toastEl), 5000);
  }
}
