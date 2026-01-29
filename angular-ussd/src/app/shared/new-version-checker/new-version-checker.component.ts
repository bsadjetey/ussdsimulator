import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NewVersionCheckerService } from 'src/app/services/new-version-checker-service';


@Component({
    selector: 'app-new-version-checker',
    templateUrl: './new-version-checker.component.html',
    styleUrls: ['./new-version-checker.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NewVersionCheckerComponent {
    @Input()
  containerClasses!: string;

    constructor(
        public newVersionCheckerService: NewVersionCheckerService
    ) { }

    applyUpdate(): void {
        this.newVersionCheckerService.applyUpdate();
    }
}