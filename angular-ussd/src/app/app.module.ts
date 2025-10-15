import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UssdSessionComponent } from './pages/ussd-session/ussd-session.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AddAppComponent } from './pages/add-app/add-app.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './shared/navbar/navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    UssdSessionComponent,
    SettingsComponent,
    AddAppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
