import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { ResetPasswordComponent } from './reset-password.component';

const esJson = {
  auth: {
    common: { back_to_login: 'Volver al inicio' },
    reset: {
      title: 'Nueva contraseña',
      subtitle: 'Elige una contraseña segura',
      field: {
        new_password: 'Nueva contraseña',
        confirm_password: 'Confirmar',
        password_placeholder: '••••••••',
      },
      submit: 'Guardar',
      submitting: 'Guardando…',
      done: {
        title: 'Guardada',
        subtitle: 'Actualizada',
        login_cta: 'Iniciar sesión',
      },
      invalid: {
        title: 'Enlace no válido',
        subtitle: 'Expirado',
        request_new: 'Solicitar nuevo',
      },
      validation: {
        new_password_required: 'Introduce contraseña',
        new_password_min: 'Mínimo 8',
        new_password_whitespace: 'Solo espacios',
        confirm_required: 'Confirma',
        password_mismatch: 'No coinciden',
      },
      error: {
        connection: 'Error de conexión',
        generic: 'Error genérico',
      },
    },
  },
  language_selector: { aria_label: 'Idioma' },
  common: { language: { es: 'ES', ca: 'CA', en: 'EN' } },
};

describe('ResetPasswordComponent', () => {
  let authResetPasswordPost: ReturnType<typeof vi.fn>;

  async function setup(token?: string) {
    authResetPasswordPost = vi.fn().mockResolvedValue({ message: 'ok' });

    await TestBed.configureTestingModule({
      imports: [
        ResetPasswordComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'reset-password', component: ResetPasswordComponent },
          { path: 'login', component: class {} },
          { path: 'forgot-password', component: class {} },
        ]),
        { provide: AuthService, useValue: { authResetPasswordPost } },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const query = token ? { token } : {};
    await router.navigate(['/reset-password'], { queryParams: query });
  }

  it('shows invalid view without token and does not call API', async () => {
    await setup();
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.view()).toBe('invalid');
    await component.onSubmit();
    expect(authResetPasswordPost).not.toHaveBeenCalled();
  });

  it('submits reset and shows done view on success', async () => {
    await setup('abc123token');
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
    await component.onSubmit();
    fixture.detectChanges();
    expect(authResetPasswordPost).toHaveBeenCalledWith({
      body: { token: 'abc123token', newPassword: 'password123' },
    });
    expect(component.view()).toBe('done');
  });

  it('shows invalid view on 400', async () => {
    await setup('bad-token');
    authResetPasswordPost.mockRejectedValueOnce(new HttpErrorResponse({ status: 400 }));
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
    await component.onSubmit();
    expect(component.view()).toBe('invalid');
  });

  it('does not call API when passwords mismatch', async () => {
    await setup('token');
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'otherpass',
    });
    await component.onSubmit();
    expect(authResetPasswordPost).not.toHaveBeenCalled();
    expect(component.mismatchTouched()).toBe(true);
  });

  it('does not submit when password is too short', async () => {
    await setup('token');
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patchValue({
      newPassword: 'short',
      confirmPassword: 'short',
    });
    await component.onSubmit();
    expect(authResetPasswordPost).not.toHaveBeenCalled();
  });

  it('calls API only once on double submit', async () => {
    await setup('token');
    const fixture = TestBed.createComponent(ResetPasswordComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.patchValue({
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
    const p1 = component.onSubmit();
    const p2 = component.onSubmit();
    await Promise.all([p1, p2]);
    expect(authResetPasswordPost).toHaveBeenCalledTimes(1);
  });
});
