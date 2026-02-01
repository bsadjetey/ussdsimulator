import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
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
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.attachListeners();
    this.scheduleInitialCheck();
  }

  // ----------------------------------
  // Update detection
  // ----------------------------------

  private attachListeners(): void {
    this.swUpdate.versionUpdates
      .pipe(
        filter(
          (evt): evt is VersionReadyEvent =>
            evt.type === 'VERSION_READY'
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.showUpdateBanner();
        });
      });
  }

  private scheduleInitialCheck(): void {
    setTimeout(() => {
      this.swUpdate.checkForUpdate().catch(() => {
        /* silently ignore */
      });
    }, this.INITIAL_CHECK_DELAY);
  }

  // ----------------------------------
  // Banner control
  // ----------------------------------

  private showUpdateBanner(): void {
    this.isNewVersionAvailable = true;
    this.startAutoHideTimer();
  }

  dismiss(): void {
    this.clearAutoHideTimer();
    this.isNewVersionAvailable = false;
  }

  private startAutoHideTimer(): void {
    this.clearAutoHideTimer();

    this.autoHideTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.isNewVersionAvailable = false;
      });
    }, this.AUTO_HIDE_MINUTES * 60 * 1000);
  }

  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = undefined;
    }
  }

  // ----------------------------------
  // Apply update
  // ----------------------------------

  applyUpdate(): void {
    this.clearAutoHideTimer();
    this.swUpdate.activateUpdate().then(() => {
      location.reload();
    });
  }

  // ----------------------------------
  // Cleanup
  // ----------------------------------

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearAutoHideTimer();
  }
}
