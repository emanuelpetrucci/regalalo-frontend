import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { AuthResponse } from '../../../core/api/generated/models/auth-response';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { RecaptchaConfigError, RecaptchaService } from '../../../core/services/recaptcha.service';
import { SessionService } from '../../../core/services/session.service';
import { RegisterComponent } from './register.component';

const esJson = {
  auth: {
    register: {
      title: 'Crear cuenta',
      subtitle: 'Regístrate para publicar y solicitar objetos en tu zona.',
      field: {
        first_name: 'Nombre',
        first_name_placeholder: 'Tu nombre',
        last_name: 'Apellidos',
        last_name_placeholder: 'Tus apellidos',
        email: 'Correo electrónico',
        email_placeholder: 'tu@email.es',
        password: 'Contraseña',
        password_placeholder: '••••••••',
        postal_code: 'Código postal',
        postal_placeholder: '28001',
        phone: 'Teléfono (opcional)',
        phone_placeholder: '+34 600 000 000',
      },
      submit: 'Crear cuenta',
      submitting: 'Creando cuenta…',
      recaptcha: 'Protegido por reCAPTCHA',
      recaptcha_privacy: 'Privacidad',
      recaptcha_terms: 'Condiciones',
      footer: '¿Ya tienes cuenta?',
      login_link: 'Iniciar sesión',
      inline_login_link: 'Iniciar sesión',
      validation: {
        first_name_required: 'Introduce tu nombre',
        first_name_min: 'Mínimo 2 caracteres',
        last_name_required: 'Introduce tus apellidos',
        last_name_min: 'Mínimo 2 caracteres',
        email_required: 'Introduce tu correo electrónico',
        email_format: 'El formato del correo no es válido',
        password_required: 'Introduce tu contraseña',
        password_min: 'Mínimo 8 caracteres',
        postal_required: 'Introduce tu código postal',
        postal_format: 'El código postal debe tener 5 dígitos',
        postal_helper: 'Para mostrarte objetos a menos de 50 km',
      },
      error: {
        connection: 'Error de conexión. Inténtalo de nuevo.',
        409: 'No pudimos crear la cuenta con este correo. ¿Ya tienes cuenta?',
        422: 'No pudimos verificar que eres humano. Inténtalo de nuevo.',
        postal_invalid: 'Código postal no válido o no encontrado',
        form_invalid: 'Revisa los datos del formulario.',
        generic: 'No pudimos completar el registro. Inténtalo más tarde.',
        field_invalid: 'Valor no válido',
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
  email: 'nuevo@example.com',
  emailVerified: false,
  firstName: 'María',
  id: 'u1',
  lastName: 'López',
  phone: null,
  postalCode: '28001',
  preferredLanguage: 'es',
  reputationScore: 0,
  totalDonated: 0,
  totalReceived: 0,
};

const validFormValue = {
  firstName: 'María',
  lastName: 'López',
  email: 'nuevo@example.com',
  password: 'password123',
  postalCode: '28001',
  phone: '',
};

describe('RegisterComponent', () => {
  let authRegisterPost: ReturnType<typeof vi.fn>;
  let usersMeGet: ReturnType<typeof vi.fn>;
  let recaptchaExecute: ReturnType<typeof vi.fn>;
  let session: SessionService;
  let router: Router;

  const mockResponse: AuthResponse = {
    token: 'jwt.test',
    user: {
      id: 'u1',
      email: 'test@example.com',
      firstName: 'María',
      lastName: 'López',
      postalCode: '28001',
      reputationScore: 0,
      totalDonated: 0,
      totalReceived: 0,
    },
  };

  beforeEach(async () => {
    localStorage.clear();
    authRegisterPost = vi.fn().mockResolvedValue(mockResponse);
    usersMeGet = vi.fn().mockResolvedValue(mockProfile);
    recaptchaExecute = vi.fn().mockResolvedValue('recaptcha-token');

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'register', component: RegisterComponent },
          { path: 'verificacion-pendiente', component: class {} },
          { path: 'login', component: class {} },
        ]),
        {
          provide: AuthService,
          useValue: { authRegisterPost },
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
    await router.navigate(['/register']);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not submit when form is invalid', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    await component.onSubmit();

    expect(authRegisterPost).not.toHaveBeenCalled();
    expect(recaptchaExecute).not.toHaveBeenCalled();
  });

  it('blocks submit when firstName is shorter than 2 characters', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({
      ...validFormValue,
      firstName: 'A',
    });

    await component.onSubmit();

    expect(authRegisterPost).not.toHaveBeenCalled();
    expect(component.fieldError('firstName')).toContain('Mínimo 2 caracteres');
  });

  it('blocks submit when firstName is whitespace-padded to fewer than 2 chars after trim', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({
      ...validFormValue,
      firstName: '  a  ',
    });

    await component.onSubmit();

    expect(authRegisterPost).not.toHaveBeenCalled();
    expect(component.fieldError('firstName')).toContain('Mínimo 2 caracteres');
  });

  it('trims firstName and lastName before sending', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({
      ...validFormValue,
      firstName: '  María  ',
      lastName: '  López  ',
    });

    await component.onSubmit();

    expect(authRegisterPost).toHaveBeenCalledWith({
      body: {
        firstName: 'María',
        lastName: 'López',
        email: 'nuevo@example.com',
        password: 'password123',
        postalCode: '28001',
        recaptchaToken: 'recaptcha-token',
      },
    });
  });

  it('calls API without phone when field is empty and navigates to verificacion-pendiente', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(recaptchaExecute).toHaveBeenCalledWith('register');
    expect(authRegisterPost).toHaveBeenCalledWith({
      body: {
        firstName: 'María',
        lastName: 'López',
        email: 'nuevo@example.com',
        password: 'password123',
        postalCode: '28001',
        recaptchaToken: 'recaptcha-token',
      },
    });
    expect(usersMeGet).toHaveBeenCalledTimes(1);
    expect(session.getToken()).toBe('jwt.test');
    expect(session.getUser()?.email).toBe('nuevo@example.com');
    expect(session.getUser()?.firstName).toBe('María');
    expect(session.getUser()?.lastName).toBe('López');
    expect(session.getUser()?.emailVerified).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/verificacion-pendiente']);
  });

  it('includes phone in payload when provided', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.form.setValue({
      ...validFormValue,
      phone: '+34 600 000 000',
    });

    await component.onSubmit();

    expect(authRegisterPost).toHaveBeenCalledWith({
      body: {
        firstName: 'María',
        lastName: 'López',
        email: 'nuevo@example.com',
        password: 'password123',
        postalCode: '28001',
        recaptchaToken: 'recaptcha-token',
        phone: '+34 600 000 000',
      },
    });
  });

  it('navigates to verificacion-pendiente when usersMeGet fails', async () => {
    usersMeGet.mockRejectedValue(new HttpErrorResponse({ status: 500 }));
    const navigateSpy = vi.spyOn(router, 'navigate');
    const setUserSpy = vi.spyOn(session, 'setUser');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/verificacion-pendiente']);
    expect(session.getToken()).toBe('jwt.test');
    expect(setUserSpy).not.toHaveBeenCalled();
    expect(session.getUser()).toBeNull();
  });

  it('does not navigate to verificacion-pendiente when usersMeGet returns 401', async () => {
    usersMeGet.mockRejectedValue(new HttpErrorResponse({ status: 401 }));
    const navigateSpy = vi.spyOn(router, 'navigate');
    const setUserSpy = vi.spyOn(session, 'setUser');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(navigateSpy).not.toHaveBeenCalledWith(['/verificacion-pendiente']);
    expect(setUserSpy).not.toHaveBeenCalled();
  });

  it('navigates to verificacion-pendiente even when profile emailVerified is true', async () => {
    usersMeGet.mockResolvedValue({ ...mockProfile, emailVerified: true });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/verificacion-pendiente']);
    expect(session.getUser()?.emailVerified).toBe(true);
  });

  it('shows translated message on 409', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({ status: 409, statusText: 'Conflict' }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(component.bannerError()).toContain('No pudimos crear la cuenta');
    expect(component.showLoginLink()).toBe(true);
  });

  it('shows translated message on 422', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({ status: 422, statusText: 'Unprocessable' }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(component.bannerError()).toContain('verificar que eres humano');
  });

  it('maps postal error on 400 geocoding failure', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Código postal no geocodificable' },
      }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({
      ...validFormValue,
      postalCode: '99999',
    });

    await component.onSubmit();

    expect(component.fieldError('postalCode')).toContain('Código postal');
  });

  it('maps firstName field error on 400 validation failure', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: [{ path: 'firstName', message: 'Invalid' }] },
      }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(component.fieldError('firstName')).toContain('Valor no válido');
  });

  it('maps lastName field error on 400 validation failure', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: [{ path: 'lastName', message: 'Invalid' }] },
      }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(component.fieldError('lastName')).toContain('Valor no válido');
  });

  it('maps phone field error on 400 validation failure', async () => {
    authRegisterPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { errors: [{ path: 'phone', message: 'Invalid' }] },
      }),
    );

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue({
      ...validFormValue,
      phone: '+34 600 000 000',
    });

    await component.onSubmit();

    expect(component.fieldError('phone')).toContain('Valor no válido');
  });

  it('shows security error when reCAPTCHA config fails', async () => {
    recaptchaExecute.mockRejectedValue(new RecaptchaConfigError('reCAPTCHA no está configurado'));

    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    await component.onSubmit();

    expect(component.bannerError()).toContain('verificación de seguridad');
    expect(authRegisterPost).not.toHaveBeenCalled();
  });

  it('prevents double submit — API called only once on rapid duplicate calls', async () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;
    component.form.setValue(validFormValue);

    const [, second] = await Promise.all([component.onSubmit(), component.onSubmit()]);
    void second;

    expect(authRegisterPost).toHaveBeenCalledTimes(1);
  });
});
