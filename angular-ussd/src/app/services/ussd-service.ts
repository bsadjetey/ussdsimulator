import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface USSDApp {
  name: string;
  app_code: string;
  app_url: string;
  description?: string;
}

export interface USSDRequest {
  text: string;
  phoneNumber: string;
  sessionId: string;
  appCode: string;
}

@Injectable({ providedIn: 'root' })
export class UssdService {
  /* ----------------------------------------------------
   * STORAGE KEYS
   * -------------------------------------------------- */
  private CUSTOM_APPS_KEY = 'custom_apps';
  private DEMO_APPS_KEY = 'demo_apps_cache';
  private SELECTED_APP_KEY = 'selected_app_code';
  private USE_CUSTOM_APPS_KEY = 'use_custom_apps';
  private PHONE_KEY = 'phone_number';

  /* ----------------------------------------------------
   * STATE
   * -------------------------------------------------- */
  private selectedAppSubject = new BehaviorSubject<USSDApp | null>(null);
  selectedApp$ = this.selectedAppSubject.asObservable();

  private apiUrl = environment.apiBaseUrl;
  private demoAppsUrl = this.apiUrl + environment.ussd.demo_apps;

  constructor(private http: HttpClient) {
    this.bootstrapSelectedApp();
  }

  /* ----------------------------------------------------
   * BOOTSTRAP
   * -------------------------------------------------- */
  private bootstrapSelectedApp() {
    const app = this.findSelectedAppInSource();
    this.selectedAppSubject.next(app);
  }

  /* ----------------------------------------------------
   * DEMO APPS
   * -------------------------------------------------- */
  getDemoApps(): Observable<USSDApp[]> {
    return this.http.get<any[]>(this.demoAppsUrl).pipe(
      map(apps => apps.map(a => this.normalizeApp(a))),
      catchError(this.handleError)
    );
  }

  reloadDemoApps(): Observable<USSDApp[]> {
    return this.getDemoApps().pipe(
      tap(apps => {
        localStorage.setItem(this.DEMO_APPS_KEY, JSON.stringify(apps));
        this.rehydrateSelectedApp(apps);
      })
    );
  }

  getCachedDemoApps(): USSDApp[] {
    return JSON.parse(localStorage.getItem(this.DEMO_APPS_KEY) || '[]');
  }

  /* ----------------------------------------------------
   * CUSTOM APPS
   * -------------------------------------------------- */
  addCustomApp(app: USSDApp): Observable<boolean> {
    const apps = this.getCustomApps();
    const index = apps.findIndex(a => a.app_code === app.app_code);

    index > -1 ? (apps[index] = app) : apps.push(app);

    localStorage.setItem(this.CUSTOM_APPS_KEY, JSON.stringify(apps));
    this.validateSelectedApp();
    return of(true);
  }

  getCustomApps(): USSDApp[] {
    return JSON.parse(localStorage.getItem(this.CUSTOM_APPS_KEY) || '[]');
  }

  /* ----------------------------------------------------
   * APP SOURCE (DEMO vs CUSTOM)
   * -------------------------------------------------- */
  setUseCustomApps(value: boolean) {
    localStorage.setItem(this.USE_CUSTOM_APPS_KEY, String(value));
    this.validateSelectedApp();
  }

  useCustomApps(): boolean {
    return localStorage.getItem(this.USE_CUSTOM_APPS_KEY) === 'true';
  }

  getApps(): USSDApp[] {
    return this.useCustomApps()
      ? this.getCustomApps()
      : this.getCachedDemoApps();
  }

  /* ----------------------------------------------------
   * SELECTED APP
   * -------------------------------------------------- */
  setSelectedApp(app: USSDApp | null) {
    if (!app) {
      localStorage.removeItem(this.SELECTED_APP_KEY);
      this.selectedAppSubject.next(null);
      return;
    }

    localStorage.setItem(this.SELECTED_APP_KEY, app.app_code);
    this.selectedAppSubject.next(app);
  }

  getSelectedApp(): USSDApp | null {
    return this.selectedAppSubject.value;
  }

  getSelectedAppName(): string {
    return this.selectedAppSubject.value?.name ?? '';
  }

  hasSelectedApp(): boolean {
    return !!this.selectedAppSubject.value;
  }

  private rehydrateSelectedApp(apps: USSDApp[]) {
    const code = localStorage.getItem(this.SELECTED_APP_KEY);
    if (!code) return;

    const app = apps.find(a => a.app_code === code);
    this.selectedAppSubject.next(app ?? null);
  }

  private validateSelectedApp() {
    const app = this.findSelectedAppInSource();
    this.selectedAppSubject.next(app);
  }

  private findSelectedAppInSource(): USSDApp | null {
    const code = localStorage.getItem(this.SELECTED_APP_KEY);
    if (!code) return null;

    return this.getApps().find(a => a.app_code === code) ?? null;
  }

  /* ----------------------------------------------------
   * PHONE NUMBER
   * -------------------------------------------------- */
  setPhoneNumber(number: string) {
    localStorage.setItem(this.PHONE_KEY, number);
  }

  getPhoneNumber(): string | null {
    return localStorage.getItem(this.PHONE_KEY);
  }

  /* ----------------------------------------------------
   * USSD SESSION
   * -------------------------------------------------- */
  generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  sendUSSD(data: USSDRequest): Observable<string> {
    const app = this.getSelectedApp();
    if (!app) return of('end Error: No app selected');

    const params = new HttpParams()
      .set('text', data.text)
      .set('phone_number', data.phoneNumber)
      .set('session_id', data.sessionId)
      .set('app_code', data.appCode);

    return this.http.get(app.app_url, {
      responseType: 'text',
      params,
    });
  }

  /* ----------------------------------------------------
   * RESET
   * -------------------------------------------------- */
  reset() {
    localStorage.removeItem(this.CUSTOM_APPS_KEY);
    localStorage.removeItem(this.DEMO_APPS_KEY);
    localStorage.removeItem(this.SELECTED_APP_KEY);
    localStorage.removeItem(this.USE_CUSTOM_APPS_KEY);
    localStorage.removeItem(this.PHONE_KEY);
    this.selectedAppSubject.next(null);
  }

  /* ----------------------------------------------------
   * NORMALIZATION
   * -------------------------------------------------- */
  private normalizeApp(app: any): USSDApp {
    return {
      name: app.name,
      app_code: app.app_code ?? app.code,
      app_url: app.app_url ?? app.url,
      description: app.description,
    };
  }

  /* ----------------------------------------------------
   * ERROR HANDLER
   * -------------------------------------------------- */
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.message || 'Unknown error');
  }
}
