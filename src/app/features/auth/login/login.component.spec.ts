import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import type { LoginResponse } from '../../../core/api/generated/models/login-response';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { RecaptchaConfigError, RecaptchaService } from '../../../core/services/recaptcha.service';
import { SessionService } from '../../../core/services/session.service';
import { markOnboardingDone } from '../../../core/constants/onboarding';
import { LoginComponent } from './login.component';

const esJson = {
  auth: {
    login: {
      title: 'Iniciar sesión',
      subtitle: 'Accede a tu cuenta para publicar y solicitar objetos.',
      field: {
        email: 'Correo electrónico',
        email_placeholder: 'tu@email.es',
        password: 'Contraseña',
        password_placeholder: '••••••••',
      },
      submit: 'Iniciar sesión',
      submitting: 'Iniciando sesión…',
      forgot_link: '¿Olvidaste tu contraseña?',
      footer: '¿No tienes cuenta?',
      register_link: 'Crear cuenta',
      session_expired: 'Tu sesión ha expirado. Inicia sesión de nuevo.',
      email_verified_success: 'Tu email ha sido verificado. Ya puedes iniciar sesión.',
      recaptcha: 'Protegido por reCAPTCHA',
      recaptcha_privacy: 'Privacidad',
      recaptcha_terms: 'Condiciones',
      validation: {
        email_required: 'Introduce tu correo electrónico',
        email_format: 'El formato del correo no es válido',
        password_required: 'Introduce tu contraseña',
      },
      error: {
        '401': 'Correo o contraseña incorrectos.',
        '422': 'No pudimos verificar que eres humano. Inténtalo de nuevo.',
        connection: 'Error de conexión. Inténtalo de nuevo.',
        generic: 'No pudimos iniciar sesión. Inténtalo más tarde.',
        recaptcha_unavailable:
          'La verificación de seguridad no está disponible. Recarga la página.',
      },
    },
  },
  language_selector: { aria_label: 'Seleccionar idioma' },
  common: { language: { es: 'Español', ca: 'Català', en: 'English' } },
};

const mockProfile: PrivateProfile = {
  avatarUrl: null,
  consecutiveNoShows: 0,
  createdAt: '2026-01-01T00:00:00Z',
  email: 'test@example.com',
  emailVerified: true,
  firstName: 'Ana',
  id: 'u1',
  lastName: 'García',
  phone: null,
  postalCode: '28001',
  preferredLanguage: 'es',
  reputationScore: 0,
  totalDonated: 0,
  totalReceived: 0,
};

describe('LoginComponent', () => {
  let authLoginPost: ReturnType<typeof vi.fn>;
  let usersMeGet: ReturnType<typeof vi.fn>;
  let recaptchaExecute: ReturnType<typeof vi.fn>;
  let session: SessionService;
  let router: Router;

  const mockResponse: LoginResponse = {
    token: 'jwt.test',
    user: {
      id: 'u1',
      email: 'test@example.com',
      firstName: 'Ana',
      lastName: 'García',
      reputationScore: 0,
    },
  };

  beforeEach(async () => {
    localStorage.clear();
    authLoginPost = vi.fn().mockResolvedValue(mockResponse);
    usersMeGet = vi.fn().mockResolvedValue(mockProfile);
    recaptchaExecute = vi.fn().mockResolvedValue('recaptcha-token');

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'login', component: LoginComponent },
          { path: 'register', component: class {} },
          { path: 'onboarding', component: class {} },
          { path: 'explorar', component: class {} },
          { path: 'verificacion-pendiente', component: class {} },
          { path: 'forgot-password', component: class {} },
        ]),
        {
          provide: AuthService,
          useValue: { authLoginPost },
        },
        {
          provide: UsersService,
          useValue: { usersMeGet },
        },
        {
          provide: RecaptchaService,
          useValue: { execute: recaptchaExecute },
        },
      ],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
    await router.navigate(['/login']);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not submit when form is invalid', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    await component.onSubmit();

    expect(authLoginPost).not.toHaveBeenCalled();
    expect(recaptchaExecute).not.toHaveBeenCalled();
  });

  it('calls API with correct params and saves session on success', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });

    await component.onSubmit();

    expect(recaptchaExecute).toHaveBeenCalledWith('login');
    expect(authLoginPost).toHaveBeenCalledWith({
      body: {
        email: 'user@example.com',
        password: 'pass1234',
        recaptchaToken: 'recaptcha-token',
      },
    });
    expect(usersMeGet).toHaveBeenCalled();
    expect(session.getToken()).toBe('jwt.test');
    expect(session.getUser()?.email).toBe('test@example.com');
    expect(session.getUser()?.emailVerified).toBe(true);
  });

  it('navigates to /onboarding when onboarding is not done', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/onboarding'], {});
  });

  it('navigates to /onboarding with returnUrl when onboarding is not done', async () => {
    await router.navigate(['/login'], { queryParams: { returnUrl: '/items/abc' } });
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/onboarding'], { queryParams: { returnUrl: '/items/abc' } });
  });

  it('navigates to /explorar on success without returnUrl when onboarding is done', async () => {
    markOnboardingDone();
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/explorar');
  });

  it('navigates to verificacion-pendiente when emailVerified is false', async () => {
    usersMeGet.mockResolvedValue({ ...mockProfile, emailVerified: false });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/verificacion-pendiente']);
    expect(session.getUser()?.emailVerified).toBe(false);
  });

  it('navigates to verificacion-pendiente when usersMeGet fails', async () => {
    usersMeGet.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/verificacion-pendiente']);
  });

  it('navigates to returnUrl on success when present and onboarding is done', async () => {
    markOnboardingDone();
    await router.navigate(['/login'], { queryParams: { returnUrl: '/items/abc' } });
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/items/abc');
  });

  it('shows translated message on 401', async () => {
    authLoginPost.mockRejectedValue(
      new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'wrong' });

    await component.onSubmit();

    expect(component.bannerError()).toContain('Correo o contraseña incorrectos');
    expect(session.getToken()).toBeNull();
    expect(session.getUser()).toBeNull();
  });

  it('navigates to /explorar when returnUrl is unsafe and onboarding is done', async () => {
    markOnboardingDone();
    await router.navigate(['/login'], {
      queryParams: { returnUrl: 'https://evil.com' },
    });
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });
    await component.onSubmit();

    expect(navigateByUrlSpy).toHaveBeenCalledWith('/explorar');
  });

  it('shows translated message on 422', async () => {
    authLoginPost.mockRejectedValue(
      new HttpErrorResponse({ status: 422, statusText: 'Unprocessable' }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });

    await component.onSubmit();

    expect(component.bannerError()).toContain('verificar que eres humano');
  });

  it('shows security error when reCAPTCHA config fails', async () => {
    recaptchaExecute.mockRejectedValue(
      new RecaptchaConfigError('reCAPTCHA no está configurado'),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });

    await component.onSubmit();

    expect(component.bannerError()).toContain('verificación de seguridad');
    expect(authLoginPost).not.toHaveBeenCalled();
  });

  it('prevents double submit — API called only once on rapid duplicate calls', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'user@example.com', password: 'pass1234' });

    await Promise.all([component.onSubmit(), component.onSubmit()]);

    expect(authLoginPost).toHaveBeenCalledTimes(1);
  });

  it('sessionExpired is true when returnUrl query param is present', async () => {
    await router.navigate(['/login'], { queryParams: { returnUrl: '/explorar' } });

    const fixture = createFixture();
    const component = fixture.componentInstance;

    expect(component.sessionExpired()).toBe(true);
  });

  it('sessionExpired is false when no returnUrl query param', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    expect(component.sessionExpired()).toBe(false);
  });

  it('shows email verified success banner when emailVerified=1', async () => {
    await router.navigate(['/login'], { queryParams: { emailVerified: '1' } });

    const fixture = createFixture();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.emailVerifiedSuccess()).toBe(true);
    expect(compiled.textContent).toContain('Tu email ha sido verificado');
    expect(compiled.querySelector('.alert-box--success')).toBeTruthy();
  });

  it('shows email validation error when email is empty and touched', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.get('email')?.markAsTouched();
    fixture.detectChanges();

    expect(component.fieldError('email')).toContain('Introduce tu correo');
  });

  it('shows password validation error when password is empty and touched', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.get('password')?.markAsTouched();
    fixture.detectChanges();

    expect(component.fieldError('password')).toContain('Introduce tu contraseña');
  });
});
