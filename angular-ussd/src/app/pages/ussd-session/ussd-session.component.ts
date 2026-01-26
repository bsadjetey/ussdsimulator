import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from 'src/app/services/toast-service';
import { USSDApp, UssdService, USSDRequest } from 'src/app/services/ussd-service';


@Component({
  selector: 'app-ussd-session',
  templateUrl: './ussd-session.component.html',
  styleUrls: ['./ussd-session.component.scss']
})
export class UssdSessionComponent
  implements OnInit, AfterViewInit, OnDestroy {

  ussdForm!: FormGroup;

  ussdContent = '';
  showInput = false;
  showEnd = false;
  loading = false;

  selectedApp: USSDApp | null = null;

  private sessionKey = 'ussd_session_id';
  private appSub?: Subscription;

  @ViewChild('inputField') inputField!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  /* ----------------------------------------------------
   * LIFECYCLE
   * -------------------------------------------------- */

  ngOnInit() {
    this.ussdForm = this.fb.group({
      inputText: [''],
    });

    // reactively track selected app
    this.appSub = this.ussd.selectedApp$.subscribe(app => {
      this.selectedApp = app || null;
      this.resetSession();
    });
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  ngOnDestroy() {
    this.appSub?.unsubscribe();
  }

  /* ----------------------------------------------------
   * SESSION MANAGEMENT
   * -------------------------------------------------- */

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

  private resetSession() {
    this.clearSession();
    this.ussdContent = '';
    this.showInput = false;
    this.showEnd = false;
    this.ussdForm.reset();
  }

  private focusInput() {
    setTimeout(() => this.inputField?.nativeElement.focus(), 100);
  }

  /* ----------------------------------------------------
   * USSD FLOW
   * -------------------------------------------------- */

  startSession() {
    if (!this.selectedApp) {
      this.toast.show('Please select an app first', 'warning');
      return;
    }

    this.resetSession();
    this.sendUSSD('');
  }

  sendUSSD(text: string) {
    if (!this.selectedApp) return;

    const phoneNumber = this.ussd.getPhoneNumber();
    if (!phoneNumber) {
      this.toast.show('Phone number not configured', 'danger');
      return;
    }

    const payload: USSDRequest = {
      text,
      phoneNumber,
      sessionId: this.getSessionId(),
      appCode: this.selectedApp.app_code,
    };

    this.loading = true;

    this.ussd.sendUSSD(payload).subscribe({
      next: (response: string) => {
        this.loading = false;

        const respType = response.slice(0, 3).toLowerCase();
        this.ussdContent = response.slice(3).trim();

        if (respType === 'con') {
          this.showInput = true;
          this.showEnd = false;
          this.focusInput();
        } else {
          this.showInput = false;
          this.showEnd = true;
          this.clearSession();
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('USSD request failed', 'danger');
      },
    });
  }

  submitInput() {
    const text = this.ussdForm.get('inputText')?.value?.trim();
    if (!text) return;

    this.sendUSSD(text);
    this.ussdForm.reset();
  }

  cancelSession() {
    this.resetSession();
  }
}
