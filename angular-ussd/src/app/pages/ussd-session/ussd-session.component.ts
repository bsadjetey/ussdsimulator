import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-ussd-session',
  templateUrl: './ussd-session.component.html',
  styleUrls: ['./ussd-session.component.scss']
})
export class UssdSessionComponent implements OnInit, AfterViewInit {
  ussdForm!: FormGroup;
  ussdContent = '';
  showInput = false;
  showEnd = false;
  loading = false;

  selectedAppName = ''; // ✅ add this line
  private sessionKey = 'ussd_session_id';

  @ViewChild('inputField') inputField!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.ussdForm = this.fb.group({
      inputText: ['']
    });

    // ✅ Load selected app name (for display)
    this.selectedAppName = this.ussd.getSelectedApp();
  }

  ngAfterViewInit() {
    if (this.inputField) {
      this.inputField.nativeElement.focus();
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem(this.sessionKey);
    if (!sessionId) {
      sessionId = this.ussd.generateSessionId();
      sessionStorage.setItem(this.sessionKey, sessionId);
    }
    return sessionId;
  }

  private clearSession() {
    sessionStorage.removeItem(this.sessionKey);
  }

  startSession() {
    this.ussdContent = '';
    this.showInput = false;
    this.showEnd = false;
    this.sendUSSD('');
  }

  sendUSSD(text: string) {
    const phoneNumber = localStorage.getItem('phone_number') || '';
    const appCode = localStorage.getItem('selected_app') || '';
    const sessionId = this.getSessionId();

    this.loading = true;

    this.ussd.sendUSSD({ text, phoneNumber, sessionId, appCode }).subscribe({
      next: (response: string) => {
        this.loading = false;
        const respType = response.slice(0, 3).toLowerCase();
        this.ussdContent = response.slice(3).trim();

        if (respType === 'con') {
          this.showInput = true;
          this.showEnd = false;
          setTimeout(() => this.inputField?.nativeElement.focus(), 100);
        } else {
          this.showInput = false;
          this.showEnd = true;
          this.clearSession();
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('USSD request failed', 'danger');
      }
    });
  }

  submitInput() {
    const text = this.ussdForm.get('inputText')?.value?.trim() || '';
    if (!text) return;
    this.sendUSSD(text);
    this.ussdForm.reset();
  }

  cancelSession() {
    this.showInput = false;
    this.showEnd = false;
    this.ussdContent = '';
    this.ussdForm.reset();
    this.clearSession();
  }
}
