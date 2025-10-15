import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
selectedAppName = localStorage.getItem('selected_app_name') || '';

  ngDoCheck() {
    this.selectedAppName = localStorage.getItem('selected_app_name') || '';
  }
}
