import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslocoService, TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import caJson from '../../../../public/i18n/ca.json';
import enJson from '../../../../public/i18n/en.json';
import esJson from '../../../../public/i18n/es.json';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { LegalPagesComponent } from './legal-pages.component';

describe('LegalPagesComponent', () => {
  const openPreferences = vi.fn();

  beforeEach(async () => {
    openPreferences.mockReset();
    await TestBed.configureTestingModule({
      imports: [
        LegalPagesComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: caJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [
        { provide: CookieConsentService, useValue: { openPreferences } },
        provideRouter([
          { path: 'explorar', component: class {} },
          { path: 'mis-objetos', component: class {} },
          { path: 'entregas', component: class {} },
          { path: 'perfil', component: class {} },
          { path: 'politica-privacidad', component: class {} },
          { path: 'politica-cookies', component: class {} },
        ]),
      ],
    }).compileComponents();
  });

  it('renderiza docs legales con eyebrow desde i18n (sin hardcode)', async () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { page: 'privacy' } } } });
    const fixture = TestBed.createComponent(LegalPagesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.doc-eyebrow')?.textContent?.trim()).toBe('Documentos legales');
    expect(root.textContent).not.toContain('Documentos legalesDocumentos legales');
  });

  it('privacidad cumple contrato estructural sin layout lateral', async () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { page: 'privacy' } } } });
    const fixture = TestBed.createComponent(LegalPagesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.page-wrap')).toBeTruthy();
    expect(root.querySelector('.doc-grid')).toBeNull();
    expect(root.querySelector('.info-box')).toBeTruthy();
    expect(root.querySelector('.doc-meta')).toBeTruthy();
    expect(root.querySelectorAll('.doc-section').length).toBe(9);
    expect(root.querySelector('#responsable')).toBeTruthy();
    expect(root.querySelector('#derechos')).toBeTruthy();
    expect(root.querySelector('.data-table')).toBeTruthy();
    expect(root.querySelector('.rights-grid')).toBeTruthy();
    expect(root.querySelector('.toc ol li')?.textContent?.length).toBeGreaterThan(0);
  });

  it('cookies cumple contrato estructural sin layout lateral', async () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { page: 'cookies' } } } });
    const fixture = TestBed.createComponent(LegalPagesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.doc-grid')).toBeNull();
    expect(root.querySelectorAll('.doc-section').length).toBe(8);
    expect(root.querySelector('#tabla')).toBeTruthy();
    expect(root.querySelectorAll('.cookie-card').length).toBe(4);
    expect(root.querySelector('.banner-preview')).toBeTruthy();
    expect(root.querySelector('.toggle-table')).toBeTruthy();
  });

  it.each([
    { lang: 'ca', eyebrow: 'Documentació legal' },
    { lang: 'en', eyebrow: 'Legal documents' },
  ] as const)('renderiza eyebrow en $lang sin claves crudas', async ({ lang, eyebrow }) => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { page: 'privacy' } } } });
    const fixture = TestBed.createComponent(LegalPagesComponent);
    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang(lang);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.doc-eyebrow')?.textContent?.trim()).toBe(eyebrow);
    expect(root.textContent).not.toContain('legal.');
  });

  it('mantiene footer legal con navegación y acción persistente accesible', async () => {
    TestBed.overrideProvider(ActivatedRoute, { useValue: { snapshot: { data: { page: 'cookies' } } } });
    const fixture = TestBed.createComponent(LegalPagesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('app-site-footer').length).toBe(1);
    expect(root.querySelector('a[href="/politica-privacidad"]')).toBeTruthy();
    expect(root.querySelector('a[href="/politica-cookies"]')).toBeTruthy();
    expect(root.querySelector('a[href="#"]')).toBeNull();

    const reopenLabel = esJson.cookies.actions.reopen_preferences;
    const reopenButton = root.querySelector(`button[aria-label="${reopenLabel}"]`) as HTMLButtonElement | null;
    expect(reopenButton).toBeTruthy();
    expect(reopenButton?.type).toBe('button');
    expect(reopenButton?.textContent?.trim()).toBe(reopenLabel);

    reopenButton?.click();
    expect(openPreferences).toHaveBeenCalledTimes(1);
  });
});
