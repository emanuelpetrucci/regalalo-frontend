import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

const esJson = {
  auth: {
    common: { back_to_login: 'Volver al inicio' },
    forgot: {
      title: 'Recuperar acceso',
      subtitle: 'Introduce tu correo',
      field: { email: 'Correo', email_placeholder: 'tu@email.es' },
      submit: 'Enviar enlace',
      submitting: 'Enviando…',
      sent: {
        title: 'Revisa tu bandeja',
        lead: 'Si ese correo está registrado',
        spam_hint: 'Comprueba spam',
      },
      recaptcha: 'Protegido por reCAPTCHA',
      recaptcha_privacy: 'Privacidad',
      recaptcha_terms: 'Condiciones',
      validation: {
        email_required: 'Introduce correo',
        email_format: 'Formato inválido',
      },
      error: {
        validation: 'Revisa el correo',
        connection: 'Error de conexión',
        generic: 'Error genérico',
      },
    },
  },
  language_selector: { aria_label: 'Idioma' },
  common: { language: { es: 'ES', ca: 'CA', en: 'EN' } },
};

describe('ForgotPasswordComponent', () => {
  let authForgotPasswordPost: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    authForgotPasswordPost = vi.fn().mockResolvedValue({ message: 'ok' });

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'forgot-password', component: ForgotPasswordComponent },
          { path: 'login', component: class {} },
        ]),
        { provide: AuthService, useValue: { authForgotPasswordPost } },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigate(['/forgot-password']);
  });

  function createFixture() {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not submit when form is invalid', async () => {
    const fixture = createFixture();
    await fixture.componentInstance.onSubmit();
    expect(authForgotPasswordPost).not.toHaveBeenCalled();
  });

  it('shows email validation error when touched', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.get('email')?.markAsTouched();
    fixture.detectChanges();
    expect(component.fieldError()).toBe('Introduce correo');
  });

  it('switches to sent view on 200', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ email: 'user@example.com' });
    await component.onSubmit();
    fixture.detectChanges();
    expect(authForgotPasswordPost).toHaveBeenCalledWith({
      body: { email: 'user@example.com' },
    });
    expect(component.view()).toBe('sent');
  });

  it('shows banner on 400', async () => {
    authForgotPasswordPost.mockRejectedValueOnce(new HttpErrorResponse({ status: 400 }));
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ email: 'user@example.com' });
    await component.onSubmit();
    fixture.detectChanges();
    expect(component.view()).toBe('form');
    expect(component.bannerError()).toContain('Revisa');
  });

  it('shows connection banner on network error', async () => {
    authForgotPasswordPost.mockRejectedValueOnce(new Error('offline'));
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ email: 'user@example.com' });
    await component.onSubmit();
    expect(component.bannerError()).toContain('conexión');
  });

  it('calls API only once on double submit', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.patchValue({ email: 'user@example.com' });
    const p1 = component.onSubmit();
    const p2 = component.onSubmit();
    await Promise.all([p1, p2]);
    expect(authForgotPasswordPost).toHaveBeenCalledTimes(1);
  });
});
