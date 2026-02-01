import { Component, Input } from '@angular/core';
import { NewVersionCheckerService } from 'src/app/services/new-version-checker-service';

@Component({
  selector: 'app-new-version-checker',
  templateUrl: './new-version-checker.component.html',
  styleUrls: ['./new-version-checker.component.scss'],
})
export class NewVersionCheckerComponent {
  @Input() containerClasses = '';

  constructor(public newVersionCheckerService: NewVersionCheckerService) {
    console.log('in version checker');
    console.log('build v2');
  }

  applyUpdate(): void {
    this.newVersionCheckerService.applyUpdate();
  }
  dismiss() {
    this.newVersionCheckerService.isNewVersionAvailable = false;
  }
}
