import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: 'perfil',
    loadComponent: () =>
      import('./perfil/perfil.component').then((m) => m.PerfilComponent),
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./perfil-publico/perfil-publico.component').then(
        (m) => m.PerfilPublicoComponent,
      ),
  },
];
