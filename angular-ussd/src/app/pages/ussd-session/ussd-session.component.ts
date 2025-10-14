import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-ussd-session',
  templateUrl: './ussd-session.component.html',
  styleUrls: ['./ussd-session.component.scss']
})
export class UssdSessionComponent implements OnInit {
  ussdForm!: FormGroup;
  ussdContent = '';
  showInput = false;
  showEnd = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.ussdForm = this.fb.group({
      inputText: ['']
    });
  }

  startSession() {
    this.sendUSSD('');
  }

  sendUSSD(text: string) {
    const phoneNumber = localStorage.getItem('phone_number') || '';
    const appCode = localStorage.getItem('selected_app') || '';
    const sessionId = this.ussd.generateSessionId();

    this.loading = true;
    this.ussd.sendUSSD({ text, phoneNumber, sessionId, appCode }).subscribe({
      next: (response: string) => {
        this.loading = false;
        const respType = response.slice(0,3).toLowerCase();
        this.ussdContent = response.slice(3);

        if (respType === 'con') {
          this.showInput = true;
          this.showEnd = false;
        } else {
          this.showInput = false;
          this.showEnd = true;
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('USSD request failed', 'danger');
      }
    });
  }

  submitInput() {
    const text = this.ussdForm.get('inputText')?.value || '';
    this.sendUSSD(text);
    this.ussdForm.reset();
  }

  cancelSession() {
    this.showInput = false;
    this.showEnd = false;
    this.ussdContent = '';
    this.ussdForm.reset();
  }
}