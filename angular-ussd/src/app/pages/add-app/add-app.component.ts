import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-add-app',
  templateUrl: './add-app.component.html',
  styleUrls: ['./add-app.component.scss']
})
export class AddAppComponent implements OnInit {
  addAppForm!: FormGroup;
  predefinedApps: any[] = [];
  selectedAppDescription: string | null = null;
  private predefinedAppsKey = 'predefined_ussd_apps';

  constructor(
    private fb: FormBuilder,
    private ussd: UssdService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.addAppForm = this.fb.group({
      appName: ['', Validators.required],
      appCode: ['', Validators.required],
      appUrl: ['', Validators.required]
    });

    this.loadPredefinedApps();
  }

  /** Load predefined apps from cache or backend */
  loadPredefinedApps() {
    const cached = localStorage.getItem(this.predefinedAppsKey);
    if (cached) {
      try {
        this.predefinedApps = JSON.parse(cached);
        return;
      } catch (e) {
        console.warn('Failed to parse cached predefined apps:', e);
      }
    }

    this.fetchAndCacheDemoApps();
  }

  /** Force reload demo apps from backend without auto-applying */
  reloadDemoApps() {
    this.fetchAndCacheDemoApps(true, false);
  }

  /**
   * Fetch demo apps from backend and cache them
   * @param force force fetch from backend
   * @param autoApply whether to auto-apply settings to the form
   */
  private fetchAndCacheDemoApps(force: boolean = false, autoApply: boolean = true) {
    if (!force && this.predefinedApps.length > 0) return;

    this.ussd.getDemoApps().subscribe({
      next: (res) => {
        this.predefinedApps = Array.isArray(res) ? res : [];
        localStorage.setItem(this.predefinedAppsKey, JSON.stringify(this.predefinedApps));

        if (autoApply && this.predefinedApps.length > 0) {
          // Optionally auto-apply the first demo app on initial load
          // Uncomment if you want first app auto-selected:
          // this.onPredefinedSelect({ target: { value: this.predefinedApps[0].app_id } });
        }

        if (force) this.toast.show('Demo apps reloaded successfully!', 'success');
      },
      error: (error) => {
        console.error('Failed to fetch predefined apps:', error);
        if (force) this.toast.show('Failed to reload demo apps', 'danger');
      }
    });
  }

  /** Add or update app */
  addApp() {
    if (this.addAppForm.invalid) {
      this.toast.show('Fill all fields', 'danger');
      return;
    }

    const { appName, appCode, appUrl } = this.addAppForm.value;
    this.ussd.addApp({ name: appName, code: appCode, url: appUrl }).subscribe();
    this.toast.show('App added successfully!', 'success');
    this.addAppForm.reset();
  }

  /** Handle predefined app selection */
  onPredefinedSelect(event: any) {
    const appId = event.target.value;
    if (!appId) {
      this.selectedAppDescription = null;
      this.addAppForm.reset();
      return;
    }

    const selectedApp = this.predefinedApps.find(a => a.app_id === appId);
    if (selectedApp) {
      this.selectedAppDescription = selectedApp.description || null;

      // Auto-populate form with selected demo app
      this.addAppForm.patchValue({
        appName: selectedApp.name,
        appCode: selectedApp.app_code,
        appUrl: selectedApp.app_url
      });

      // Auto-apply predefined app settings in the service
      this.ussd.applyPredefinedApp(selectedApp);
    }
  }
}
