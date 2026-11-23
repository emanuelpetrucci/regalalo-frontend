import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';
import caJson from '../../../../../public/i18n/ca.json';
import enJson from '../../../../../public/i18n/en.json';
import esJson from '../../../../../public/i18n/es.json';
import { LandingFooterComponent } from './landing-footer.component';

describe('LandingFooterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingFooterComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: caJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: '', component: class {} },
          { path: 'login', component: class {} },
          { path: 'como-funciona/reputacion', component: class {} },
        ]),
      ],
    }).compileComponents();
  });

  it('renders public platform links, not app shell routes', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('a[href="/login"]')).toBeTruthy();
    expect(root.querySelector('a[href="/como-funciona/reputacion"]')).toBeTruthy();
    expect(root.querySelector('a[href="/explorar"]')).toBeNull();
    expect(root.querySelector('a[href="/mis-objetos"]')).toBeNull();
  });

  it('opens cookie preferences from footer control', async () => {
    const fixture = TestBed.createComponent(LandingFooterComponent);
    const cookieConsent = TestBed.inject(CookieConsentService);
    const openSpy = vi.spyOn(cookieConsent, 'openPreferences').mockImplementation(() => undefined);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector(
      'button[aria-label="Configurar cookies"]',
    ) as HTMLButtonElement | null;
    trigger?.click();

    expect(openSpy).toHaveBeenCalledTimes(1);
  });
});
