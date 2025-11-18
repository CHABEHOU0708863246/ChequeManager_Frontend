// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { InfoFormComponent } from './core/features/info-form/info-form.component';
import { ChequeImprimComponent } from './core/features/cheque-imprim/cheque-imprim.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/info-form',
    pathMatch: 'full'
  },
  {
    path: 'info-form',
    component: InfoFormComponent
  },
  {
    path: 'cheque-imprim',
    component: ChequeImprimComponent
  },
  {
    path: '**',
    redirectTo: '/info-form'
  }
];
