import { Routes } from '@angular/router';
import { purgeAuthStorageGuard } from '../../core/guards/guest-session.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'reset-password',
    canActivate: [purgeAuthStorageGuard],
    loadComponent: () =>
      import('./reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'verificacion-pendiente',
    loadComponent: () =>
      import('./verification-pending/verification-pending.component').then(
        (m) => m.VerificationPendingComponent,
      ),
  },
  {
    path: 'verificar-email',
    loadComponent: () =>
      import('./verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent,
      ),
  },
];
