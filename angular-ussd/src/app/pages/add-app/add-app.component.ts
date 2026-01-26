import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService, USSDApp } from 'src/app/services/ussd-service';


@Component({
  selector: 'app-add-app',
  templateUrl: './add-app.component.html',
})
export class AddAppComponent implements OnInit {
  addAppForm!: FormGroup;

  demoApps: any[] = [];
  selectedAppDescription: string | null = null;

  loadingDemoApps = false;

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.addAppForm = this.fb.group({
      appName: ['', Validators.required],
      appCode: ['', Validators.required],
      appUrl: ['', Validators.required],
    });

    this.loadDemoApps();
  }

  /* ----------------------------------------------------
   * DEMO APPS
   * -------------------------------------------------- */

  loadDemoApps() {
    const cached = this.ussd.getCachedDemoApps();
    if (cached.length) {
      this.demoApps = cached;
      return;
    }

    this.reloadDemoApps();
  }

  reloadDemoApps() {
    this.loadingDemoApps = true;

    this.ussd.reloadDemoApps().subscribe({
      next: (apps) => {
        this.demoApps = apps;
        this.toast.show('Demo apps reloaded', 'success');
      },
      error: () => {
        this.toast.show('Failed to load demo apps', 'danger');
      },
      complete: () => (this.loadingDemoApps = false),
    });
  }

  /* ----------------------------------------------------
   * ADD CUSTOM APP
   * -------------------------------------------------- */

  addApp() {
    if (this.addAppForm.invalid) {
      this.toast.show('Fill all fields', 'danger');
      return;
    }

    const app: USSDApp = {
      name: this.addAppForm.value.appName,
      app_code: this.addAppForm.value.appCode,
      app_url: this.addAppForm.value.appUrl,
    };

    this.ussd.addCustomApp(app).subscribe(() => {
      this.toast.show('Custom app saved', 'success');
      this.addAppForm.reset();
      this.selectedAppDescription = null;
    });
  }

  /* ----------------------------------------------------
   * DEMO APP SELECTION
   * -------------------------------------------------- */

  onDemoSelect(event: any) {
    const appId = event.target.value;
    if (!appId) {
      this.addAppForm.reset();
      this.selectedAppDescription = null;
      return;
    }

    const app = this.demoApps.find(a => a.app_id === appId);
    if (!app) return;

    this.selectedAppDescription = app.description || null;

    // Copy demo app into the form (user must explicitly save)
    this.addAppForm.patchValue({
      appName: app.name,
      appCode: app.app_code,
      appUrl: app.app_url,
    });
  }
}
