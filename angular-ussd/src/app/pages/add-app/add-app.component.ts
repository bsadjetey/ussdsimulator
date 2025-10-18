import { HttpClient } from '@angular/common/http';
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
    private toast: ToastService,
    private http: HttpClient
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

    // Fetch from backend only if not cached
    this.ussd.getDemoApps().subscribe({
      next: (res) => {
        this.predefinedApps = Array.isArray(res) ? res : [];
        // Cache the result
        localStorage.setItem(this.predefinedAppsKey, JSON.stringify(this.predefinedApps));
      },
      error: (error) => {
        console.error('Failed to fetch predefined apps:', error);
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

    const selectedApp = this.predefinedApps.find(a => a.id === appId);
    if (selectedApp) {
      this.selectedAppDescription = selectedApp.description || null;
      this.addAppForm.patchValue({
        appName: selectedApp.name,
        appCode: selectedApp.app_code,
        appUrl: selectedApp.app_url
      });

      this.ussd.applyPredefinedApp(selectedApp);
    }
  }
}
