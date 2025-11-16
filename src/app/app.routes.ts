import { Routes } from '@angular/router';
import { ChequeFormComponent } from './core/features/cheque-form/cheque-form.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/cheque-form',
    pathMatch: 'full'
  },
  {
    path: 'cheque-form',
    component: ChequeFormComponent
  },
  {
    path: '**',
    redirectTo: '/cheque-form'
  }
];
