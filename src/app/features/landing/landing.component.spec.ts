import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { LandingComponent } from './landing.component';

const esJson = {
  landing: {
    nav: {
      login: 'Iniciar sesión',
      register: 'Crear cuenta',
      menu_open: 'Abrir menú',
      menu_close: 'Cerrar menú',
    },
    hero: {
      pill: 'Distribución comunitaria',
      headline_1: 'Lo que ya no usas,',
      headline_em: 'alguien lo necesita',
      lead: 'Una plataforma donde los objetos encuentran nuevas manos.',
      cta_primary: 'Unirme a la comunidad',
      cta_secondary: 'Cómo funciona',
      note: 'Gratis.',
    },
    footer: {
      col_legal: 'Legal',
      link_legal_notice: 'Aviso legal',
      link_privacy: 'Privacidad',
      link_cookies: 'Política de cookies',
    },
    meta: {
      title: 'Regálalo — objetos con nueva vida',
      description: 'Una plataforma comunitaria donde los objetos encuentran nuevas manos.',
    },
  },
  cookies: { actions: { reopen_preferences: 'Configurar cookies' } },
  language_selector: { aria_label: 'Seleccionar idioma' },
  common: { language: { es: 'Español', ca: 'Català', en: 'English' } },
};

const enJson = {
  landing: {
    nav: {
      login: 'Sign in',
      register: 'Create account',
      menu_open: 'Open menu',
      menu_close: 'Close menu',
    },
    hero: {
      pill: 'Community',
      headline_1: 'What you no longer use,',
      headline_em: 'someone needs it',
      lead: 'A platform where objects find new hands.',
      cta_primary: 'Join the community',
      cta_secondary: 'How it works',
      note: 'Free.',
    },
    footer: {
      col_legal: 'Legal',
      link_legal_notice: 'Legal notice',
      link_privacy: 'Privacy',
      link_cookies: 'Cookie policy',
    },
    meta: { title: 'Regálalo', description: 'Community system.' },
  },
  cookies: { actions: { reopen_preferences: 'Cookie settings' } },
  language_selector: { aria_label: 'Select language' },
  common: { language: { es: 'Español', ca: 'Català', en: 'English' } },
};

describe('LandingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: {} },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: '', component: LandingComponent },
          { path: 'login', component: class {} },
          { path: 'register', component: class {} },
          { path: 'politica-privacidad', component: class {} },
          { path: 'politica-cookies', component: class {} },
        ]),
      ],
    }).compileComponents();
  });

  it('renders hero headline in default locale (es)', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent).toContain('Lo que ya no usas,');
    expect(h1?.textContent).toContain('alguien lo necesita');
  });

  it('renders nav login link in Spanish', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const loginLink = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/login"]',
    );
    expect(loginLink?.textContent?.trim()).toBe('Iniciar sesión');
  });

  it('usa rutas reales en footer legal y no href placeholder', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('a[href="#"]')).toBeNull();
    expect(root.querySelector('a[href="/politica-privacidad"]')).toBeTruthy();
    expect(root.querySelector('a[href="/politica-cookies"]')).toBeTruthy();
  });

  it('invoca reapertura de preferencias desde el control del footer', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const cookieConsent = TestBed.inject(CookieConsentService);
    const openSpy = vi.spyOn(cookieConsent, 'openPreferences').mockImplementation(() => undefined);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Configurar cookies"]',
    ) as HTMLButtonElement | null;
    expect(trigger).toBeTruthy();
    trigger?.click();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('control de cookies en footer es focalizable y activable por teclado', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const cookieConsent = TestBed.inject(CookieConsentService);
    const openSpy = vi.spyOn(cookieConsent, 'openPreferences').mockImplementation(() => undefined);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Configurar cookies"]',
    ) as HTMLButtonElement | null;

    expect(trigger).toBeTruthy();
    expect(trigger?.type).toBe('button');
    trigger?.focus();
    expect(document.activeElement).toBe(trigger);

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    trigger?.click();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    trigger?.click();

    expect(openSpy).toHaveBeenCalledTimes(2);
  });
});
