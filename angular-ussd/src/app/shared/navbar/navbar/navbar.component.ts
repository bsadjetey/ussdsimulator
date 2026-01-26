import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UssdService } from 'src/app/services/ussd-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  selectedAppName = '';
  private sub!: Subscription;

  constructor(private ussd: UssdService) {}

  ngOnInit() {
    this.sub = this.ussd.selectedApp$.subscribe(app => {
      // ✅ guard against string / null values
      if (app && typeof app === 'object' && app.name) {
        this.selectedAppName = app.name;
      } else {
        this.selectedAppName = '';
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
