import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent, VersionEvent } from '@angular/service-worker';
import { Subject, filter, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService implements OnDestroy {

  isNewVersionAvailable = false;

  /** Auto-hide duration (minutes) */
  private readonly AUTO_HIDE_MINUTES = 5;

  /** Delay before first update check (ms) */
  private readonly INITIAL_CHECK_DELAY = 5000;

  private destroy$ = new Subject<void>();
  private autoHideTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private swUpdate: SwUpdate,
    private ngZone: NgZone
  ) {
    console.group('[UpdateChecker]');
    console.log('Service constructed');
    console.log('SW enabled:', this.swUpdate.isEnabled);
    console.log('User agent:', navigator.userAgent);
    console.log('Online:', navigator.onLine);
    console.groupEnd();

    if (!this.swUpdate.isEnabled) {
      console.warn('[UpdateChecker] Service worker NOT enabled — exiting');
      return;
    }

    this.attachListeners();
    this.scheduleInitialCheck();
  }

  // ----------------------------------
  // Update detection
  // ----------------------------------

  private attachListeners(): void {
    console.log('[UpdateChecker] Attaching versionUpdates listener');

    this.swUpdate.versionUpdates
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (evt: VersionEvent) => {
          console.group('[UpdateChecker] versionUpdates event');
          console.log('Event type:', evt.type);
          console.log('Full event:', evt);
          console.groupEnd();

          if (evt.type === 'VERSION_READY') {
            this.ngZone.run(() => {
              console.log('[UpdateChecker] VERSION_READY detected → showing banner');
              this.showUpdateBanner();
            });
          }
        },
        error: (err) => {
          console.error('[UpdateChecker] versionUpdates stream error', err);
        }
      });
  }

  private scheduleInitialCheck(): void {
    console.log(
      `[UpdateChecker] Scheduling initial check in ${this.INITIAL_CHECK_DELAY}ms`
    );

    setTimeout(() => {
      console.log('[UpdateChecker] Running checkForUpdate()');

      this.swUpdate.checkForUpdate()
        .then((result) => {
          console.log('[UpdateChecker] checkForUpdate() resolved:', result);
        })
        .catch((err) => {
          console.error('[UpdateChecker] checkForUpdate() FAILED', err);
        });

    }, this.INITIAL_CHECK_DELAY);
  }

  // ----------------------------------
  // Banner control
  // ----------------------------------

  private showUpdateBanner(): void {
    console.log('[UpdateChecker] showUpdateBanner()');

    this.isNewVersionAvailable = true;
    this.startAutoHideTimer();
  }

  dismiss(): void {
    console.log('[UpdateChecker] Banner dismissed by user');

    this.clearAutoHideTimer();
    this.isNewVersionAvailable = false;
  }

  private startAutoHideTimer(): void {
    console.log(
      `[UpdateChecker] Starting auto-hide timer (${this.AUTO_HIDE_MINUTES} min)`
    );

    this.clearAutoHideTimer();

    this.autoHideTimer = setTimeout(() => {
      this.ngZone.run(() => {
        console.log('[UpdateChecker] Auto-hide timer fired → hiding banner');
        this.isNewVersionAvailable = false;
      });
    }, this.AUTO_HIDE_MINUTES * 60 * 1000);
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      console.log('[UpdateChecker] Clearing auto-hide timer');
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = undefined;
    }
  }

  // ----------------------------------
  // Apply update
  // ----------------------------------

  applyUpdate(): void {
    console.log('[UpdateChecker] applyUpdate() clicked');

    this.clearAutoHideTimer();

    this.swUpdate.activateUpdate()
      .then(() => {
        console.log('[UpdateChecker] activateUpdate() resolved → reloading');
        location.reload();
      })
      .catch((err) => {
        console.error('[UpdateChecker] activateUpdate() FAILED', err);
      });
  }

  // ----------------------------------
  // Cleanup
  // ----------------------------------

  ngOnDestroy(): void {
    console.log('[UpdateChecker] ngOnDestroy()');

    this.destroy$.next();
    this.destroy$.complete();
    this.clearAutoHideTimer();
  }
}
