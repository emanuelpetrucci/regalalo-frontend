import { Routes } from '@angular/router';

export const PUBLIC_ITEMS_ROUTES: Routes = [
  {
    path: 'explorar',
    loadComponent: () =>
      import('./explorar/explorar.component').then((m) => m.ExplorarComponent),
  },
  {
    path: 'items/:slug',
    loadComponent: () =>
      import('./detalle/detalle.component').then((m) => m.DetalleComponent),
  },
];

export const PROTECTED_ITEMS_ROUTES: Routes = [
  {
    path: 'mis-objetos/publicar',
    loadComponent: () =>
      import('./publicar/publicar.component').then((m) => m.PublicarComponent),
  },
  {
    path: 'mis-objetos',
    loadComponent: () =>
      import('./mis-objetos/mis-objetos.component').then(
        (m) => m.MisObjetosComponent,
      ),
  },
];

export const ITEMS_ROUTES: Routes = [...PUBLIC_ITEMS_ROUTES, ...PROTECTED_ITEMS_ROUTES];
