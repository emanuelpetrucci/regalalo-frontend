import { Routes } from '@angular/router';

export const DELIVERY_ROUTES: Routes = [
  {
    path: 'entregas',
    loadComponent: () =>
      import('./entregas/entregas.component').then((m) => m.EntregasComponent),
  },
  {
    path: 'entregas/:id',
    loadComponent: () =>
      import('./entregas/entregas.component').then((m) => m.EntregasComponent),
  },
];
