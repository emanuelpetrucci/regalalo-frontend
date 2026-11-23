import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import caJson from '../../../../../public/i18n/ca.json';
import enJson from '../../../../../public/i18n/en.json';
import esJson from '../../../../../public/i18n/es.json';
import { LandingNavComponent } from './landing-nav.component';

describe('LandingNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LandingNavComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: caJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: '', component: class {} },
          { path: 'login', component: class {} },
          { path: 'register', component: class {} },
        ]),
      ],
    }).compileComponents();
  });

  it('closes mobile menu on Escape', async () => {
    const fixture = TestBed.createComponent(LandingNavComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.toggleMobileMenu();
    fixture.detectChanges();
    expect(fixture.componentInstance.mobileMenuOpen()).toBe(true);

    fixture.componentInstance.onEscapeKey();
    fixture.detectChanges();
    expect(fixture.componentInstance.mobileMenuOpen()).toBe(false);
  });

  it('renders landing nav links in Spanish', async () => {
    const fixture = TestBed.createComponent(LandingNavComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.nav .brand')?.textContent?.trim()).toBe('Regálalo');
    expect(root.querySelector('a[href="/login"]')?.textContent?.trim()).toBe('Iniciar sesión');
  });
});
