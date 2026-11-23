import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, expect, it } from 'vitest';
import caJson from '../../../../public/i18n/ca.json';
import enJson from '../../../../public/i18n/en.json';
import esJson from '../../../../public/i18n/es.json';
import { SessionService } from '../../core/services/session.service';
import { ReputationGuideComponent } from './reputation-guide.component';

describe('ReputationGuideComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReputationGuideComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: caJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [
        provideRouter(
          [
            { path: 'explorar', component: class {} },
            { path: 'mis-objetos', component: class {} },
            { path: 'entregas', component: class {} },
            { path: 'perfil', component: class {} },
            { path: 'reputacion', component: class {} },
            { path: 'login', component: class {} },
            { path: 'register', component: class {} },
          ],
          withComponentInputBinding(),
        ),
        { provide: SessionService, useValue: { user: () => null } },
      ],
    }).compileComponents();
  });

  it('renders main sections from i18n', async () => {
    const fixture = TestBed.createComponent(ReputationGuideComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1.doc-title')?.textContent?.trim()).toBe('Tu reputación');
    expect(root.querySelector('#ganar .block-title')?.textContent?.trim()).toBe('Cómo ganar puntos');
    expect(root.querySelector('#perder .block-title')?.textContent?.trim()).toBe(
      'Cuándo bajan los puntos',
    );
    expect(root.querySelector('#visibilidad .block-title')?.textContent?.trim()).toBe(
      'Qué pasa si no donas',
    );
    expect(root.querySelector('a[href="/reputacion"]')).toBeTruthy();
    expect(root.querySelector('a[href="/explorar"]')).toBeTruthy();
  });

  it('renders landing-style nav in public mode', async () => {
    const fixture = TestBed.createComponent(ReputationGuideComponent);
    fixture.componentRef.setInput('publicMode', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-landing-nav')).toBeTruthy();
    expect(root.querySelector('app-landing-nav .nav')).toBeTruthy();
    expect(root.querySelector('app-landing-nav a[href="/"]')).toBeTruthy();
    expect(root.querySelector('app-landing-nav a[href="/login"]')).toBeTruthy();
    expect(root.querySelector('app-landing-nav a[href="/register"]')).toBeTruthy();
    expect(root.querySelector('.top-nav')).toBeNull();
    expect(root.querySelector('app-landing-footer')).toBeTruthy();
    expect(root.querySelector('app-site-footer')).toBeNull();
    expect(root.querySelector('app-landing-footer a[href="/login"]')).toBeTruthy();
    expect(root.querySelector('app-landing-footer a[href="/explorar"]')).toBeNull();
  });
});
