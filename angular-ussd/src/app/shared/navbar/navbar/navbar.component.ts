import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
selectedAppName = '';
  private sub!: Subscription;

  constructor(private ussd: UssdService) {}

  ngOnInit() {
    this.sub = this.ussd.selectedAppName$.subscribe(
      name => this.selectedAppName = name
    );
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
