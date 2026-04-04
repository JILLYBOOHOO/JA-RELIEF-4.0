import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { SurvivorEntryComponent } from './pages/survivor-entry/survivor-entry.component';
import { DonateComponent } from './pages/donate/donate.component';

import { WifiAccessComponent } from './pages/wifi-access/wifi-access.component';
import { HelpComponent } from './pages/help/help.component';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { InfoComponent } from './pages/info/info.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'contact-us', component: HelpComponent },
    { path: 'information', component: InfoComponent },
    { path: 'wifi-access', component: WifiAccessComponent },
    { path: 'donate', component: DonateComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'admin', component: AdminDashboardComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
