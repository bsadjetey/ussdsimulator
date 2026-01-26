import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface USSDApp {
  name: string;
  app_code: string;
  url: string;
}

export interface USSDRequest {
  text: string;
  phoneNumber: string;
  sessionId: string;
  appCode: string;
}

@Injectable({ providedIn: 'root' })
export class UssdService {
  /** Storage keys */
  private CUSTOM_APPS_KEY = 'custom_apps';
  private DEMO_APPS_KEY = 'demo_apps_cache';
  private SELECTED_APP_KEY = 'selected_app';
  private USE_CUSTOM_APPS_KEY = 'use_custom_apps';
  private PHONE_KEY = 'phone_number';

  /** Reactive selected app */
  private selectedAppSubject = new BehaviorSubject<any>(null);

  selectedApp$ = this.selectedAppSubject.asObservable();

  private apiUrl = environment.apiBaseUrl;
  private demoAppsUrl = this.apiUrl + environment.ussd.demo_apps;

  constructor(private http: HttpClient) {}

  /* ----------------------------------------------------
   * DEMO APPS
   * -------------------------------------------------- */

  /** Fetch demo apps from backend */
  getDemoApps(): Observable<any[]> {
    return this.http
      .get<any[]>(this.demoAppsUrl)
      .pipe(catchError(this.handleError));
  }

  /** Reload demo apps and cache */
  reloadDemoApps(): Observable<any[]> {
    return this.getDemoApps().pipe(
      tap((apps) => {
        localStorage.setItem(this.DEMO_APPS_KEY, JSON.stringify(apps));
      }),
    );
  }

  /** Get cached demo apps */
  getCachedDemoApps(): any[] {
    return JSON.parse(localStorage.getItem(this.DEMO_APPS_KEY) || '[]');
  }

  /* ----------------------------------------------------
   * CUSTOM APPS
   * -------------------------------------------------- */

  /** Add or update custom app */
  addCustomApp(app: USSDApp): Observable<boolean> {
    const apps = this.getCustomApps();
    const index = apps.findIndex((a) => a.app_code === app.app_code);

    index > -1 ? (apps[index] = app) : apps.push(app);

    localStorage.setItem(this.CUSTOM_APPS_KEY, JSON.stringify(apps));
    return of(true);
  }

  /** Get custom apps */
  getCustomApps(): USSDApp[] {
    return JSON.parse(localStorage.getItem(this.CUSTOM_APPS_KEY) || '[]');
  }

  /* ----------------------------------------------------
   * APP SOURCE (DEMO vs CUSTOM)
   * -------------------------------------------------- */

  setUseCustomApps(value: boolean) {
    localStorage.setItem(this.USE_CUSTOM_APPS_KEY, String(value));
  }

  useCustomApps(): boolean {
    return localStorage.getItem(this.USE_CUSTOM_APPS_KEY) === 'true';
  }

  /* ----------------------------------------------------
   * SELECTED APP
   * -------------------------------------------------- */

  setSelectedApp(app: any) {
    if (!app) return;
    localStorage.setItem('selected_app', JSON.stringify(app)); // store full object
    this.selectedAppSubject.next(app); // emit for Navbar & Session
  }

  getSelectedApp(): any {
    const cached = localStorage.getItem('selected_app');
    return cached ? JSON.parse(cached) : null;
  }

  private loadSelectedApp(): USSDApp | null {
    const raw = localStorage.getItem(this.SELECTED_APP_KEY);
    return raw ? JSON.parse(raw) : null;
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

    return this.http.get(app.app_url, { responseType: 'text', params });
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
   * ERROR HANDLER
   * -------------------------------------------------- */

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.message || 'Unknown error');
  }
}
