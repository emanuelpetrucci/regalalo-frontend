import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { VerifyEmailComponent } from './verify-email.component';

const esJson = {
  auth: {
    verifyEmail: {
      loading_title: 'Verificando tu correo…',
      loading_lead: 'Espera un momento mientras confirmamos tu enlace.',
      error: {
        invalid_title: 'Enlace no válido',
        connection_title: 'Error de conexión',
        generic_title: 'No se pudo verificar',
        invalid: 'El enlace no es válido o ha expirado.',
        connection: 'Error de conexión. Inténtalo de nuevo.',
        generic: 'No pudimos verificar tu correo. Inténtalo más tarde.',
      },
      cta_resend: 'Solicitar nuevo enlace',
    },
  },
  language_selector: { aria_label: 'Idioma' },
  common: { language: { es: 'ES', ca: 'CA', en: 'EN' } },
};

describe('VerifyEmailComponent', () => {
  let authVerifyEmailGet: ReturnType<typeof vi.fn>;
  let routerNavigate: ReturnType<typeof vi.fn>;

  async function setup(
    queryParams: Record<string, string> = { token: 'abc' },
    options: { platformId?: unknown; navigateResult?: boolean } = {},
  ) {
    const { platformId = 'browser', navigateResult = true } = options;
    authVerifyEmailGet = vi.fn().mockResolvedValue({ message: 'ok' });
    routerNavigate = vi.fn().mockResolvedValue(navigateResult);

    await TestBed.configureTestingModule({
      imports: [
        VerifyEmailComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'verificar-email', component: VerifyEmailComponent },
          { path: 'login', component: class {} },
          { path: 'verificacion-pendiente', component: class {} },
        ]),
        { provide: AuthService, useValue: { authVerifyEmailGet } },
        { provide: Router, useValue: { navigate: routerNavigate } },
        { provide: PLATFORM_ID, useValue: platformId },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();
  }

  it('does not call API without token and shows error view', async () => {
    await setup({});
    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();

    expect(authVerifyEmailGet).not.toHaveBeenCalled();
    expect(fixture.componentInstance.view()).toBe('error');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Enlace no válido');
    expect(compiled.textContent).toContain('Solicitar nuevo enlace');
  });

  it('does not call API when token is whitespace only', async () => {
    await setup({ token: '   ' });
    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();

    expect(authVerifyEmailGet).not.toHaveBeenCalled();
    expect(fixture.componentInstance.view()).toBe('error');
  });

  it('does not call API during SSR (non-browser platform)', async () => {
    await setup({ token: 'abc' }, { platformId: {} });
    expect(isPlatformBrowser({})).toBe(false);

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();

    expect(authVerifyEmailGet).not.toHaveBeenCalled();
    expect(fixture.componentInstance.view()).toBe('loading');
  });

  it('calls API with token and navigates to login on success', async () => {
    await setup({ token: 'valid-token' });
    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authVerifyEmailGet).toHaveBeenCalledWith({ token: 'valid-token' });
    expect(routerNavigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { emailVerified: '1' },
    });
  });

  it('shows error view on 400', async () => {
    await setup({ token: 'bad-token' });
    authVerifyEmailGet.mockRejectedValue(
      new HttpErrorResponse({ status: 400, statusText: 'Bad Request' }),
    );

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.view()).toBe('error');
    expect(fixture.componentInstance.errorKind()).toBe('invalid');
    expect(fixture.componentInstance.bannerError()).toContain('no es válido');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Solicitar nuevo enlace');
  });

  it('shows connection error on status 0', async () => {
    await setup({ token: 'token' });
    authVerifyEmailGet.mockRejectedValue(
      new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }),
    );

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.view()).toBe('error');
    expect(fixture.componentInstance.errorKind()).toBe('connection');
    expect(fixture.componentInstance.bannerError()).toContain('Error de conexión');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Error de conexión');
  });

  it('shows generic error on 500', async () => {
    await setup({ token: 'token' });
    authVerifyEmailGet.mockRejectedValue(
      new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
    );

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.view()).toBe('error');
    expect(fixture.componentInstance.errorKind()).toBe('generic');
    expect(fixture.componentInstance.bannerError()).toContain('No pudimos verificar');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se pudo verificar');
  });

  it('shows error when navigation to login is rejected', async () => {
    await setup({ token: 'valid-token' }, { navigateResult: false });
    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await vi.waitUntil(() => fixture.componentInstance.view() === 'error');
    fixture.detectChanges();

    expect(routerNavigate).toHaveBeenCalled();
    expect(fixture.componentInstance.view()).toBe('error');
    expect(fixture.componentInstance.errorKind()).toBe('generic');
    expect(fixture.componentInstance.bannerError()).toContain('No pudimos verificar');
  });

  it('shows loading state while verifying', async () => {
    await setup({ token: 'slow' });
    authVerifyEmailGet.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: 'ok' }), 50)),
    );

    const fixture = TestBed.createComponent(VerifyEmailComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.view()).toBe('loading');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Verificando tu correo');
  });
});
