import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SitemapComponent } from './sitemap.component';

const routes: Routes = [
  { path: '', component: SitemapComponent }
];

@NgModule({
  declarations: [SitemapComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SitemapModule { }
