import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
  isNewVersionAvailable = false;

  constructor(
    private swUpdate: SwUpdate,
    private ngZone: NgZone,
  ) {
    console.log('[UpdateChecker] service constructed');
    console.log('[UpdateChecker] SW enabled:', this.swUpdate.isEnabled);

    if (this.swUpdate.isEnabled) {
      this.attachListeners();
    }

    setTimeout(() => {
      console.log('[UpdateChecker] manual checkForUpdate()');
      this.swUpdate.checkForUpdate();
    }, 5000);
  }

  private attachListeners(): void {
    this.swUpdate.versionUpdates.subscribe((evt) => {
      console.log('[UpdateChecker] EVENT:', evt);
      console.log('[UpdateChecker] EVENT TYPE:', evt.type);
      console.log('[UpdateChecker] TIME:', new Date().toISOString());

      if (evt.type === 'VERSION_READY') {
        this.ngZone.run(() => {
          console.log('[UpdateChecker] VERSION_READY detected');
          this.isNewVersionAvailable = true;
        });
      }
    });
  }

  applyUpdate(): void {
    console.log('[UpdateChecker] Applying update...');
    this.swUpdate.activateUpdate().then(() => location.reload());
  }


}
