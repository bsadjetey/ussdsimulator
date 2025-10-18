import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UssdService, USSDApp } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-add-app',
  templateUrl: './add-app.component.html',
  styleUrls: ['./add-app.component.scss']
})
export class AddAppComponent implements OnInit {
  addAppForm!: FormGroup;
  predefinedApps: any[] = [];
  selectedAppDescription: string | null = null;

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
      appUrl:  ['', Validators.required]
    });

    // Fetch predefined apps
    this.fetchDemoApps();
  }
  
  fetchDemoApps() {
    this.ussd.getDemoApps().subscribe({
      next: (res)=>{
        this.predefinedApps = res;
      },
      error: (error)=>{
        console.error(error);
      }
    })
  }

  addApp() {
    if (this.addAppForm.invalid) {
      this.toast.show('Fill both fields', 'danger');
      return;
    }

    const { appName, appCode, appUrl } = this.addAppForm.value;
    this.ussd.addApp({ name: appName, code: appCode, url:appUrl }).subscribe();
    this.toast.show('App added successfully!', 'success');
    this.addAppForm.reset();
  }

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
        appUrl: selectedApp.app_url,
      });

      // console.log(selectedApp);
      // Auto-apply settings
      this.ussd.applyPredefinedApp(selectedApp);
    }
  }
}
