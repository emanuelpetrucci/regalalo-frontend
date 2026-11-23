import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { VerificationPendingComponent } from './verification-pending.component';

const esJson = {
  auth: {
    common: { back_to_login: 'Volver al inicio' },
    verificationPending: {
      title: 'Verifica tu correo electrónico',
      lead: 'Te hemos enviado un enlace.',
      resend_btn: 'Reenviar email de verificación',
      resend_btn_cooldown: 'Reenviar email ({{ seconds }}s)',
      already_verified_title: 'Tu email ya está verificado',
      already_verified_lead: 'Ya puedes iniciar sesión.',
      already_verified_cta: 'Ir a iniciar sesión',
      error: {
        connection: 'Error de conexión',
        generic: 'Error genérico',
      },
    },
  },
  language_selector: { aria_label: 'Idioma' },
  common: { language: { es: 'ES', ca: 'CA', en: 'EN' } },
};

describe('VerificationPendingComponent', () => {
  let authResendVerificationPost: ReturnType<typeof vi.fn>;

  async function setup() {
    authResendVerificationPost = vi.fn().mockResolvedValue({ message: 'ok' });

    await TestBed.configureTestingModule({
      imports: [
        VerificationPendingComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'verificacion-pendiente', component: VerificationPendingComponent },
          { path: 'login', component: class {} },
        ]),
        { provide: AuthService, useValue: { authResendVerificationPost } },
      ],
    }).compileComponents();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-27T09:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title and resend button by default', async () => {
    await setup();
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Verifica tu correo electrónico');
    expect(compiled.querySelector('button')?.textContent).toContain('Reenviar email de verificación');
  });

  it('calls authResendVerificationPost on click and starts 30s cooldown on 200', async () => {
    await setup();
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(authResendVerificationPost).toHaveBeenCalledTimes(1);
    expect(component.cooldownSeconds()).toBe(30);
    expect(component.isInCooldown()).toBe(true);
  });

  it('uses Retry-After header value on 429', async () => {
    await setup();
    authResendVerificationPost.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 429,
        headers: new HttpHeaders({ 'Retry-After': '60' }),
      }),
    );
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(component.cooldownSeconds()).toBe(60);
  });

  it('uses default 30s cooldown on 429 without Retry-After', async () => {
    await setup();
    authResendVerificationPost.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 429 }),
    );
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(component.cooldownSeconds()).toBe(30);
  });

  it('uses Retry-After HTTP-date value on 429', async () => {
    await setup();
    authResendVerificationPost.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 429,
        headers: new HttpHeaders({ 'Retry-After': 'Wed, 27 May 2026 09:01:00 GMT' }),
      }),
    );
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(component.cooldownSeconds()).toBe(60);
  });

  it('clamps Retry-After numeric value to minimum 1 second', async () => {
    await setup();
    authResendVerificationPost.mockRejectedValueOnce(
      new HttpErrorResponse({
        status: 429,
        headers: new HttpHeaders({ 'Retry-After': '0' }),
      }),
    );
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(component.cooldownSeconds()).toBe(1);
    expect(component.isInCooldown()).toBe(true);
  });

  it('sets alreadyVerified on 409', async () => {
    await setup();
    authResendVerificationPost.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 409 }),
    );
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    fixture.detectChanges();

    expect(component.alreadyVerified()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Tu email ya está verificado');
  });

  it('does not call API when cooldown is active', async () => {
    await setup();
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    authResendVerificationPost.mockClear();

    await component.onResend();
    expect(authResendVerificationPost).not.toHaveBeenCalled();
  });

  it('decrements cooldown every second and clears at 0', async () => {
    await setup();
    const fixture = TestBed.createComponent(VerificationPendingComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    await component.onResend();
    expect(component.cooldownSeconds()).toBe(30);

    vi.advanceTimersByTime(1000);
    expect(component.cooldownSeconds()).toBe(29);

    vi.advanceTimersByTime(29000);
    expect(component.cooldownSeconds()).toBe(0);
    expect(component.isInCooldown()).toBe(false);
  });
});
