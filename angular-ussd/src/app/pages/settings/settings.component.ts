import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  apps: any[] = [];

  constructor(private fb: FormBuilder, private ussd: UssdService, private toast: ToastService) {}

  ngOnInit() {
    this.apps = this.ussd.getApps();

    const selectedApp = this.ussd.getSelectedApp();

    this.settingsForm = this.fb.group({
      phoneNumber: [this.ussd.getPhoneNumber() || '', Validators.required],
      selectedApp: [selectedApp.code, Validators.required]
    });
  }

  saveSettings() {
    if (this.settingsForm.invalid) {
      this.toast.show('Fill all fields', 'danger');
      return;
    }

    const { appUrl, phoneNumber, selectedApp } = this.settingsForm.value;

    const app = this.apps.find(a => a.code === selectedApp);

    this.ussd.setAppUrl(appUrl);
    this.ussd.setPhoneNumber(phoneNumber);
    this.ussd.setSelectedApp(app);
    this.ussd.setAppUrl(app.url);

    this.toast.show('Settings saved successfully!', 'success');
  }

  deleteApps() {
    this.ussd.clearApps();
    this.ussd.clearSettings();
    this.toast.show('Apps & settings deleted successfully! Only default apps remain.', 'success');

    this.apps = [];
    // Reset form
    this.settingsForm.reset();
  }
}
