import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WifiAccessComponent } from './wifi-access.component';
import { QRCodeModule } from 'angularx-qrcode';

const routes: Routes = [
  { path: '', component: WifiAccessComponent }
];

@NgModule({
  declarations: [WifiAccessComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    QRCodeModule
  ]
})
export class WifiAccessModule { }
