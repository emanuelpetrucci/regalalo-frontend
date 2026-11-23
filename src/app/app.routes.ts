import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { purgeAuthStorageGuard } from './core/guards/guest-session.guard';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { DELIVERY_ROUTES } from './features/delivery/delivery.routes';
import { PROTECTED_ITEMS_ROUTES, PUBLIC_ITEMS_ROUTES } from './features/items/items.routes';
import { PROFILE_ROUTES } from './features/profile/profile.routes';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    data: { locale: 'es' },
  },
  {
    path: 'en',
    pathMatch: 'full',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    data: { locale: 'en' },
  },
  {
    path: 'ca',
    pathMatch: 'full',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    data: { locale: 'ca' },
  },
  {
    path: 'politica-privacidad',
    loadComponent: () =>
      import('./features/legal/legal-pages.component').then((m) => m.LegalPagesComponent),
    data: { page: 'privacy', publicMode: true },
  },
  {
    path: 'politica-cookies',
    loadComponent: () =>
      import('./features/legal/legal-pages.component').then((m) => m.LegalPagesComponent),
    data: { page: 'cookies', publicMode: true },
  },
  {
    path: 'reputacion',
    loadComponent: () =>
      import('./features/reputation/reputation-guide.component').then(
        (m) => m.ReputationGuideComponent,
      ),
  },
  {
    path: 'como-funciona/reputacion',
    loadComponent: () =>
      import('./features/reputation/reputation-guide.component').then(
        (m) => m.ReputationGuideComponent,
      ),
    data: { locale: 'es', publicMode: true },
  },
  {
    path: 'ca/com-funciona/reputacio',
    loadComponent: () =>
      import('./features/reputation/reputation-guide.component').then(
        (m) => m.ReputationGuideComponent,
      ),
    data: { locale: 'ca', publicMode: true },
  },
  {
    path: 'en/how-it-works/reputation',
    loadComponent: () =>
      import('./features/reputation/reputation-guide.component').then(
        (m) => m.ReputationGuideComponent,
      ),
    data: { locale: 'en', publicMode: true },
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/onboarding/onboarding.component').then(
        (m) => m.OnboardingComponent,
      ),
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: AUTH_ROUTES,
  },
  {
    path: '',
    component: AppShellComponent,
    children: PUBLIC_ITEMS_ROUTES,
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [...PROTECTED_ITEMS_ROUTES, ...DELIVERY_ROUTES, ...PROFILE_ROUTES],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
