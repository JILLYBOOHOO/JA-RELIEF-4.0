import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SurvivorEntryComponent } from './pages/survivor-entry/survivor-entry.component';
import { DonateComponent } from './pages/donate/donate.component';


import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { InfoComponent } from './pages/info/info.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
    { path: '', component: HomeComponent, data: { breadcrumb: 'Home' } },
    { path: 'help', loadChildren: () => import('./pages/survivor-entry/survivor-entry.module').then(m => m.SurvivorEntryModule), data: { breadcrumb: 'Request Aid' } },
    { path: 'donate', loadChildren: () => import('./pages/donate/donate.module').then(m => m.DonateModule), data: { breadcrumb: 'Donate' } },
    { path: 'wifi-access', loadChildren: () => import('./pages/wifi-access/wifi-access.module').then(m => m.WifiAccessModule), data: { breadcrumb: 'Wifi Vouchers' } },
    { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule), data: { breadcrumb: 'Register' } },
    { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule), data: { breadcrumb: 'Login' } },
    { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard], data: { breadcrumb: 'Dashboard' } },
    { path: 'information', loadChildren: () => import('./pages/info/info.module').then(m => m.InfoModule), data: { breadcrumb: 'Information' } },
    { path: 'sitemap', loadChildren: () => import('./pages/sitemap/sitemap.module').then(m => m.SitemapModule), data: { breadcrumb: 'Sitemap' } },
    { path: 'privacy', loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyModule), data: { breadcrumb: 'Privacy Statement' } },
    { path: 'admin', loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule), canActivate: [AuthGuard], data: { roles: ['admin'], breadcrumb: 'Admin Portal' } },
    { path: 'maintenance', loadChildren: () => import('./pages/maintenance/maintenance.module').then(m => m.MaintenanceModule), data: { breadcrumb: 'System Status' } },
    { path: '**', redirectTo: '' }
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
