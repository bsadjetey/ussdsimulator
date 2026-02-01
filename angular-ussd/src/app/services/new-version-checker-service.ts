import { Injectable, NgZone } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewVersionCheckerService {
  isNewVersionAvailable = false;
  newVersionSubscription?: Subscription;

  constructor(
    private swUpdate: SwUpdate,
    private ngZone: NgZone
  ) {
    console.log('swupdate constructor');
    this.checkForUpdate();
  }

  checkForUpdate(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.newVersionSubscription?.unsubscribe();

    this.newVersionSubscription =
      this.swUpdate.versionUpdates.subscribe(evt => {
        switch (evt.type) {

          case 'VERSION_DETECTED':
            console.log('Downloading new app version:', evt.version.hash);
            break;

          case 'VERSION_READY':
            console.log('New app version ready:', evt.latestVersion.hash);

            // 👇 THIS is the missing piece
            this.ngZone.run(() => {
              this.isNewVersionAvailable = true;
            });

            break;

          case 'VERSION_INSTALLATION_FAILED':
            console.error('SW install failed:', evt.error);
            break;
        }
      });
  }

  applyUpdate(): void {
    this.swUpdate.activateUpdate()
      .then(() => document.location.reload());
  }
}
