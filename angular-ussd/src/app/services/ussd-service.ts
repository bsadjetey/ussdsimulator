import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface USSDRequest {
  text: string;
  phoneNumber: string;
  sessionId: string;
  appCode: string;
}

export interface USSDApp {
  name: string;
  code: string;
  url:  string;
}

@Injectable({
  providedIn: 'root'
})
export class UssdService {
  private localStorageKey = 'ussd_apps';
  private settingsKey = 'ussd_settings';
  private selectedAppSubject = new BehaviorSubject<any>(
    localStorage.getItem('selected_app') || ''
  );
  selectedApp$ = this.selectedAppSubject.asObservable();

  cfg: any;
  private apiUrl: string;
  private demoAppsUrl: string;

  constructor(private http: HttpClient) {
    this.cfg = environment;
    this.apiUrl = this.cfg.apiBaseUrl;
    this.demoAppsUrl = this.apiUrl + this.cfg.ussd.demo_apps;
  }


  getDemoApps(){
    return this.http
      .get<any[]>(this.demoAppsUrl)
      .pipe(catchError(this.handleError));
  }

  /** Generate unique session id per USSD session */
  generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  /** Send USSD request to configured endpoint */
  sendUSSD(data: USSDRequest): Observable<string> {
    const appUrl = this.getAppUrl();
    if (!appUrl) return of('end Error: App URL not configured');

    const params = new HttpParams()
      .set('text', data.text)
      .set('phone_number', data.phoneNumber)
      .set('session_id', data.sessionId)
      .set('app_code', data.appCode);

    return this.http.get(appUrl, { responseType: 'text', params });
  }

  /** Add or update app in localStorage */
  addApp(app: USSDApp): Observable<boolean> {
    const apps: USSDApp[] = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    const existingIndex = apps.findIndex(a => a.code === app.code);

    if (existingIndex > -1) {
      apps[existingIndex] = app; // Update existing
    } else {
      apps.push(app); // Add new
    }

    localStorage.setItem(this.localStorageKey, JSON.stringify(apps));
    return of(true);
  }

  /** Get all saved apps */
  getApps(): USSDApp[] {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }

  setAppUrl(url: string) { localStorage.setItem('app_url', url); }
  getAppUrl(): string | null { return localStorage.getItem('app_url'); }

  setPhoneNumber(number: string) { localStorage.setItem('phone_number', number); }
  getPhoneNumber(): string | null { return localStorage.getItem('phone_number'); }

  setSelectedApp(app: any) {
    localStorage.setItem('selected_app', app.name);
    this.selectedAppSubject.next(app);
  }
  getSelectedApp(): any { return this.selectedAppSubject.value; }

  /** Save custom settings for an app */
  saveSettings(settings: any) { localStorage.setItem(this.settingsKey, JSON.stringify(settings)); }
  getSettings(): any {
    const settings = localStorage.getItem(this.settingsKey);
    return settings ? JSON.parse(settings) : null;
  }

  /** Clear all saved apps and user settings (keeps predefined apps externally) */
  clearApps() { localStorage.removeItem(this.localStorageKey); }
  clearSettings() {
    localStorage.removeItem(this.settingsKey);
    localStorage.removeItem('app_url');
    localStorage.removeItem('phone_number');
    localStorage.removeItem('selected_app');
    this.selectedAppSubject.next('');
  }

  /** Auto-apply predefined app */
  applyPredefinedApp(app: any) {
    if (!app) return;
    // this.setSelectedApp(app);
    this.setAppUrl(app.endpoint);
    this.addApp({ name: app.name, code: app.app_code, url: app.app_url }).subscribe();
    if (app.settings) this.saveSettings(app.settings);
  }

    private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (!errorRes.error) {
      return throwError(errorMessage);
    }
    errorMessage = errorRes.error;
    return throwError(errorMessage);
  }
}
