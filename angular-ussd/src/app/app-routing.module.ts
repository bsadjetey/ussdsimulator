import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAppComponent } from './pages/add-app/add-app.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { UssdSessionComponent } from './pages/ussd-session/ussd-session.component';

const routes: Routes = [
  { path: '', component: UssdSessionComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'add-app', component: AddAppComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
