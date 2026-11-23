import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import { CookieConsentService } from '../services/cookie-consent.service';
import { SeoService } from './seo.service';
import { LandingSeoService } from './landing-seo.service';

const esJson = {
  landing: {
    meta: {
      title: 'Regálalo',
      description: 'Comparte objetos con tu comunidad',
    },
    seo: {
      faq: {
        section_title: 'Preguntas frecuentes',
        q1: 'q1', a1: 'a1',
        q2: 'q2', a2: 'a2',
        q3: 'q3', a3: 'a3',
        q4: 'q4', a4: 'a4',
        q5: 'q5', a5: 'a5',
        q6: 'q6', a6: 'a6',
        q7: 'q7', a7: 'a7',
        q8: 'q8', a8: 'a8',
      },
    },
  },
};

describe('LandingSeoService', () => {
  const canRun = vi.fn<(category: 'analytics' | 'marketing' | 'preferences') => boolean>();

  beforeEach(() => {
    canRun.mockReset();
    canRun.mockReturnValue(false);

    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: esJson, ca: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [{ provide: CookieConsentService, useValue: { canRun } }],
    });
  });

  afterEach(() => {
    const documentRef = TestBed.inject(DOCUMENT);
    documentRef.getElementById('ga-gtag')?.remove();
    documentRef.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    vi.restoreAllMocks();
  });

  it('no inyecta analytics sin consentimiento de categoria analytics', () => {
    const service = TestBed.inject(LandingSeoService);
    service.initAnalyticsIfNeeded();

    const script = TestBed.inject(DOCUMENT).getElementById('ga-gtag');
    expect(script).toBeNull();
    expect(canRun).toHaveBeenCalledWith('analytics');
  });

  it('inyecta analytics una sola vez cuando analytics=true', () => {
    canRun.mockReturnValue(true);
    const service = TestBed.inject(LandingSeoService);

    service.initAnalyticsIfNeeded();
    service.initAnalyticsIfNeeded();

    const scripts = TestBed.inject(DOCUMENT).querySelectorAll('#ga-gtag');
    expect(scripts.length).toBe(1);
  });

  it('respeta gating estricto antes de consentimiento y carga una sola vez tras concederlo', () => {
    canRun.mockReturnValueOnce(false).mockReturnValue(true);
    const service = TestBed.inject(LandingSeoService);

    service.initAnalyticsIfNeeded();
    expect(TestBed.inject(DOCUMENT).getElementById('ga-gtag')).toBeNull();

    service.initAnalyticsIfNeeded();
    service.initAnalyticsIfNeeded();

    const scripts = TestBed.inject(DOCUMENT).querySelectorAll('#ga-gtag');
    expect(scripts.length).toBe(1);
    expect(canRun).toHaveBeenCalledWith('analytics');
  });

  it('no inyecta analytics cuando solo marketing esta permitido', () => {
    canRun.mockImplementation((category) => category === 'marketing');
    const service = TestBed.inject(LandingSeoService);

    service.initAnalyticsIfNeeded();

    expect(TestBed.inject(DOCUMENT).getElementById('ga-gtag')).toBeNull();
    expect(canRun).toHaveBeenCalledWith('analytics');
  });

  it('mantiene metadatos SEO aunque analytics este denegada', () => {
    const service = TestBed.inject(LandingSeoService);

    service.apply('es');

    expect(TestBed.inject(Title).getTitle().length).toBeGreaterThan(0);
    expect(TestBed.inject(SeoService)).toBeDefined();
    expect(TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')).not.toBeNull();
    expect(TestBed.inject(DOCUMENT).getElementById('ga-gtag')).toBeNull();
  });

  describe('AC1: html lang dinámico', () => {
    it('asigna lang="es" al elemento html para locale es', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('es');
    });

    it('asigna lang="en" al elemento html para locale en', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('en');
      expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    });

    it('asigna lang="ca" al elemento html para locale ca', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('ca');
      expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('ca');
    });
  });

  describe('AC2: og:image PNG con dimensiones OG', () => {
    it('og:image apunta a un archivo .png', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const tag = TestBed.inject(Meta).getTag('property="og:image"');
      expect(tag?.content).toMatch(/\.png$/);
    });

    it('og:image:width es 1200', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const tag = TestBed.inject(Meta).getTag('property="og:image:width"');
      expect(tag?.content).toBe('1200');
    });

    it('og:image:height es 630', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const tag = TestBed.inject(Meta).getTag('property="og:image:height"');
      expect(tag?.content).toBe('630');
    });

    it('og:image:type es image/png', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const tag = TestBed.inject(Meta).getTag('property="og:image:type"');
      expect(tag?.content).toBe('image/png');
    });
  });

  describe('AC1: buildFaq retorna 8 items', () => {
    function getFaqScript(locale: 'es' | 'ca' | 'en') {
      const service = TestBed.inject(LandingSeoService);
      service.apply(locale);
      const document = TestBed.inject(DOCUMENT);
      const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
      return Array.from(scripts).find((s) => {
        const content = s.textContent;
        if (!content) return false;
        try { return JSON.parse(content)['@type'] === 'FAQPage'; } catch { return false; }
      });
    }

    it('genera 8 preguntas FAQ para locale es', () => {
      const faqScript = getFaqScript('es');
      expect(faqScript?.textContent).toBeTruthy();
      expect(JSON.parse(faqScript!.textContent!).mainEntity).toHaveLength(8);
    });

    it('genera 8 preguntas FAQ para locale ca', () => {
      const faqScript = getFaqScript('ca');
      expect(faqScript?.textContent).toBeTruthy();
      expect(JSON.parse(faqScript!.textContent!).mainEntity).toHaveLength(8);
    });

    it('genera 8 preguntas FAQ para locale en', () => {
      const faqScript = getFaqScript('en');
      expect(faqScript?.textContent).toBeTruthy();
      expect(JSON.parse(faqScript!.textContent!).mainEntity).toHaveLength(8);
    });
  });

  describe('AC2: Organization schema con areaServed y foundingLocation', () => {
    it('Organization schema incluye areaServed con Spain', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const document = TestBed.inject(DOCUMENT);
      const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
      const orgScript = Array.from(scripts).find((s) => {
        const content = s.textContent;
        if (!content) return false;
        try { return JSON.parse(content)['@type'] === 'Organization'; } catch { return false; }
      });
      expect(orgScript?.textContent).toBeTruthy();
      const orgData = JSON.parse(orgScript!.textContent!);
      expect(orgData.areaServed).toEqual({ '@type': 'Country', name: 'Spain' });
      expect(orgData.foundingLocation).toEqual({ '@type': 'Country', name: 'Spain' });
    });
  });

  describe('AC3: SoftwareApplication schema presente', () => {
    it('emite un schema SoftwareApplication con availability en Offer', () => {
      const service = TestBed.inject(LandingSeoService);
      service.apply('es');
      const document = TestBed.inject(DOCUMENT);
      const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
      const appScript = Array.from(scripts).find((s) => {
        const content = s.textContent;
        if (!content) return false;
        try { return JSON.parse(content)['@type'] === 'SoftwareApplication'; } catch { return false; }
      });
      expect(appScript?.textContent).toBeTruthy();
      const appData = JSON.parse(appScript!.textContent!);
      expect(appData.name).toBe('Regálalo');
      expect(appData.applicationCategory).toBe('SocialNetworkingApplication');
      expect(appData.operatingSystem).toBe('Web');
      expect(appData.offers?.availability).toBe('https://schema.org/InStock');
    });
  });
});
