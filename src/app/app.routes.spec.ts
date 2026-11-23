import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { createMockJwt } from './core/testing/jwt-test-utils';
import { SessionService, TOKEN_KEY, USER_KEY } from './core/services/session.service';
import { routes } from './app.routes';

const minimalI18n = {
  landing: {
    hero: { title: 'Regálalo', lead: '' },
    cta: { login: '' },
    meta: { title: '', description: '' },
    footer: {
      tagline: '',
      col_platform: '',
      link_login: '',
      link_register: '',
      link_how: '',
      col_legal: '',
      link_legal_notice: '',
      link_privacy: '',
      link_cookies: '',
      copy: '',
      made_in: '',
    },
  },
  legal: { privacy: { title: '', lead: '' }, cookies: { title: '', lead: '' } },
  cookies: { actions: { reopen_preferences: '' } },
  auth: {
    layout: { tagline: '', copy: '', footer: '', note: '' },
    register: {
      title: '', subtitle: '', field: { email: '', email_placeholder: '', password: '', password_placeholder: '', postal_code: '', postal_placeholder: '' },
      submit: '', submitting: '', recaptcha: '', recaptcha_privacy: '', recaptcha_terms: '', footer: '', login_link: '', inline_login_link: '',
      validation: { email_required: '', email_format: '', password_required: '', password_min: '', postal_required: '', postal_format: '', postal_helper: '' },
      error: { connection: '', '409': '', '422': '', postal_invalid: '', form_invalid: '', generic: '', field_invalid: '', recaptcha_unavailable: '' },
    },
  },
  nav: { explore: 'Explorar', my_items: 'Mis objetos', deliveries: 'Entregas', profile: 'Perfil', publish: 'Publicar' },
  language_selector: { aria_label: '' },
  common: { language: { es: 'Español', ca: 'Català', en: 'English' } },
};

@Component({ template: '<router-outlet />', imports: [RouterOutlet] })
class RouterHostComponent {}

describe('app routes', () => {
  let router: Router;
  let session: SessionService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [
        RouterHostComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: minimalI18n },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [provideRouter(routes)],
    }).compileComponents();

    router = TestBed.inject(Router);
    session = TestBed.inject(SessionService);
    TestBed.createComponent(RouterHostComponent);
  });

  afterEach(() => {
    localStorage.clear();
  });

  async function navigateAndDetect(path: string): Promise<HTMLElement> {
    await router.navigateByUrl(path);
    const fixture = TestBed.createComponent(RouterHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('loads landing at root without auth or app shell', async () => {
    const root = await navigateAndDetect('/');
    expect(root.querySelector('app-landing')).toBeTruthy();
    expect(root.querySelector('app-auth-layout')).toBeNull();
    expect(root.querySelector('app-shell')).toBeNull();
    expect(router.url).toBe('/');
  });

  it('purges auth localStorage when visiting landing', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'leak@example.com',
      reputationScore: 0,
      emailVerified: true,
    });

    await navigateAndDetect('/');

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(session.getToken()).toBeNull();
    expect(session.getUser()).toBeNull();
  });

  it('purges auth localStorage when visiting login', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'leak@example.com',
      reputationScore: 0,
    });

    await navigateAndDetect('/login');

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it('loads public auth routes inside auth layout', async () => {
    const publicRoutes = [
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
    ];

    for (const path of publicRoutes) {
      const root = await navigateAndDetect(path);
      expect(router.url).toBe(path);
      expect(root.querySelector('app-auth-layout')).toBeTruthy();
      expect(root.querySelector('app-shell')).toBeNull();
    }
  });

  it('loads /explorar without auth (public route)', async () => {
    const root = await navigateAndDetect('/explorar');
    expect(router.url).toBe('/explorar');
    expect(root.querySelector('app-shell')).toBeTruthy();
    expect(root.querySelector('app-auth-layout')).toBeNull();
  });

  it('redirects protected routes to verificacion-pendiente when authenticated but email not verified', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: false,
    });

    await navigateAndDetect('/mis-objetos');

    expect(router.url).toBe('/verificacion-pendiente');
  });

  it('redirects protected routes to login with returnUrl when unauthenticated', async () => {
    await navigateAndDetect('/mis-objetos');

    expect(router.url).toContain('/login');
    expect(router.url).toContain('returnUrl');
    expect(decodeURIComponent(router.url)).toContain('/mis-objetos');
  });

  it('loads protected routes inside app shell when authenticated and email verified', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: true,
    });

    const protectedRoutes = [
      '/explorar',
      '/mis-objetos',
      '/mis-objetos/publicar',
      '/entregas',
      '/entregas/11111111-2222-4333-8444-555555555555',
      '/perfil',
    ];

    for (const path of protectedRoutes) {
      const root = await navigateAndDetect(path);
      expect(router.url).toBe(path);
      expect(root.querySelector('app-shell')).toBeTruthy();
      expect(root.querySelector('app-auth-layout')).toBeNull();
    }
  });

  it('loads not-found for unknown routes', async () => {
    const root = await navigateAndDetect('/ruta-inexistente');
    expect(root.querySelector('app-not-found')).toBeTruthy();
    expect(root.querySelector('app-auth-layout')).toBeNull();
  });

  it('loads legal routes without auth guard or app shell', async () => {
    const legalRoutes = ['/politica-privacidad', '/politica-cookies'];

    for (const path of legalRoutes) {
      const root = await navigateAndDetect(path);
      expect(router.url).toBe(path);
      expect(root.querySelector('app-legal-pages')).toBeTruthy();
      expect(root.querySelector('app-auth-layout')).toBeNull();
      expect(root.querySelector('app-shell')).toBeNull();
    }
  });

  it('loads reputation guide without auth guard or app shell', async () => {
    const root = await navigateAndDetect('/reputacion');
    expect(router.url).toBe('/reputacion');
    expect(root.querySelector('app-reputation-guide')).toBeTruthy();
    expect(root.querySelector('app-auth-layout')).toBeNull();
    expect(root.querySelector('app-shell')).toBeNull();
  });

  it('loads public reputation guide at como-funciona/reputacion', async () => {
    const root = await navigateAndDetect('/como-funciona/reputacion');
    expect(router.url).toBe('/como-funciona/reputacion');
    expect(root.querySelector('app-reputation-guide')).toBeTruthy();
    expect(root.querySelector('app-landing-nav')).toBeTruthy();
    expect(root.querySelector('app-auth-layout')).toBeNull();
    expect(root.querySelector('app-shell')).toBeNull();
  });

  it('switches reputation nav when reusing the guide between public and app routes', async () => {
    await router.navigateByUrl('/reputacion');
    const fixture = TestBed.createComponent(RouterHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    let root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.top-nav')).toBeTruthy();
    expect(root.querySelector('app-landing-nav')).toBeNull();

    await router.navigateByUrl('/como-funciona/reputacion');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-landing-nav')).toBeTruthy();
    expect(root.querySelector('.top-nav')).toBeNull();

    await router.navigateByUrl('/reputacion');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.top-nav')).toBeTruthy();
    expect(root.querySelector('app-landing-nav')).toBeNull();
  });
});
