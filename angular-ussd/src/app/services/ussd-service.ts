import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface USSDRequest {
  text: string;
  phoneNumber: string;
  sessionId: string;
  appCode: string;
}

export interface USSDApp {
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class UssdService {
  private localStorageKey = 'ussd_apps';

  constructor(private http: HttpClient) {}

  /**
   * Generate unique session id per USSD session
   */
  generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Send USSD request to the configured endpoint
   */
  sendUSSD(data: USSDRequest): Observable<string> {
    const appUrl = localStorage.getItem('app_url');
    if (!appUrl) {
      return of('end Error: App URL not configured');
    }

    const params = new HttpParams()
      .set('text', data.text)
      .set('phone_number', data.phoneNumber)
      .set('session_id', data.sessionId)
      .set('app_code', data.appCode);

    return this.http.get(appUrl, { responseType: 'text', params });
  }

  /**
   * Add new app to localStorage
   */
  addApp(app: USSDApp): Observable<boolean> {
    console.log(app);
    const apps = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
    apps.push(app);
    localStorage.setItem(this.localStorageKey, JSON.stringify(apps));
    return of(true);
  }

  /**
   * Get all saved apps from localStorage
   */
  getApps(): USSDApp[] {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }
}
