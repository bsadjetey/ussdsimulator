import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { USSDApp, UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  apps: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.apps = this.ussd.getApps();
    const selectedApp = this.ussd.getSelectedApp();

    this.settingsForm = this.fb.group({
      appUrl: [localStorage.getItem('app_url') || '', Validators.required],
      phoneNumber: [localStorage.getItem('phone_number') || '', Validators.required],
      selectedApp: [selectedApp, Validators.required]
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.toast.show('Fill all fields', 'danger');
      return;
    }

    const { appUrl, phoneNumber, selectedApp } = this.settingsForm.value;
    this.ussd.setAppUrl(appUrl);
    this.ussd.setPhoneNumber(phoneNumber);
    this.ussd.setSelectedApp(selectedApp);
    // localStorage.setItem('phone_number', phoneNumber);
    // localStorage.setItem('selected_app', selectedApp);

    this.toast.show('Settings saved successfully!', 'success');
  }
}
