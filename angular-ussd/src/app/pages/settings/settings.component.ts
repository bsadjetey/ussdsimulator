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
  isCustomApps = false;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      phoneNumber: [this.ussd.getPhoneNumber()],
      useCustomApps: [this.ussd.useCustomApps()],
      selectedApp: ['']
    });

    this.isCustomApps = this.settingsForm.value.useCustomApps;

    this.loadApps();

    // React to toggle
    this.settingsForm
      .get('useCustomApps')!
      .valueChanges.subscribe(val => {
        this.isCustomApps = val;
        this.ussd.setUseCustomApps(val);
        this.loadApps();
      });
  }

  loadApps() {
    this.apps = this.isCustomApps
      ? this.ussd.getCustomApps()
      : this.ussd.getCachedDemoApps();

    const current = this.ussd.getSelectedApp();
    if (current) {
      this.settingsForm.patchValue({ selectedApp: current.code });
    }
  }

  reloadDemoApps() {
    this.ussd.reloadDemoApps().subscribe(() => {
      this.loadApps();
      this.toast.show('Demo apps reloaded', 'success');
    });
  }

saveSettings() {
  const formValue = this.settingsForm.value;
  // Save phone number
  this.ussd.setPhoneNumber(formValue.phoneNumber);
  // Save selected app
  const selectedAppCode = formValue.selectedApp;

  const allApps = [...this.apps]; // get both custom & demo apps
  const selectedApp = allApps.find(a => a.app_code === selectedAppCode);

  if (selectedApp) {
    this.ussd.setSelectedApp(selectedApp);  // ✅ crucial
    // this.ussd.setAppUrl(selectedApp.url);   // optional, keeps URL updated
  }

  this.toast.show('Settings saved!', 'success');
}


  resetAll() {
    this.ussd.reset();
    this.settingsForm.reset({ useCustomApps: false });
    this.loadApps();
    this.toast.show('Simulator reset', 'warning');
  }
}

