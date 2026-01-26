import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService, USSDApp } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  apps: USSDApp[] = [];
  isCustomApps = false;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      phoneNumber: [this.ussd.getPhoneNumber(), Validators.required],
      useCustomApps: [this.ussd.useCustomApps()],
      selectedApp: ['', Validators.required],
    });

    this.isCustomApps = this.settingsForm.value.useCustomApps;

    this.loadApps();

    // React to Demo / Custom toggle
    this.settingsForm
      .get('useCustomApps')!
      .valueChanges.subscribe((val: boolean) => {
        this.isCustomApps = val;
        this.ussd.setUseCustomApps(val);
        this.loadApps();
      });
  }

  loadApps() {
    this.apps = this.isCustomApps
      ? this.ussd.getCustomApps()
      : this.ussd.getCachedDemoApps();

    const selected = this.ussd.getSelectedApp();
    if (selected) {
      this.settingsForm.patchValue({
        selectedApp: selected.app_code,
      });
    }
  }

  reloadDemoApps() {
    this.ussd.reloadDemoApps().subscribe(() => {
      this.loadApps();
      this.toast.show('Demo apps reloaded', 'success');
    });
  }

  saveSettings() {
    const { phoneNumber, selectedApp } = this.settingsForm.value;

    // Persist phone number
    this.ussd.setPhoneNumber(phoneNumber);

    // Persist selected app
    const app = this.apps.find((a) => a.app_code === selectedApp);
    if (app) {
      this.ussd.setSelectedApp(app);
    }

    this.toast.show('Settings saved!', 'success');
  }

  resetAll() {
    this.ussd.reset();

    this.settingsForm.reset({
      phoneNumber: '',
      useCustomApps: false,
      selectedApp: '',
    });

    this.isCustomApps = false;
    this.loadApps();

    this.toast.show('Simulator reset', 'warning');
  }
}
