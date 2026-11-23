import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { SessionService } from '../../core/services/session.service';
import { AppShellComponent } from './app-shell.component';

const esJson = {
  nav: {
    explore: 'Explorar',
    my_items: 'Mis objetos',
    deliveries: 'Entregas',
    profile: 'Perfil',
    publish: 'Publicar',
    publish_object: 'Publicar objeto',
    menu: 'Menú',
    logout: 'Cerrar sesión',
  },
  language_selector: { aria_label: 'Seleccionar idioma' },
  common: { language: { es: 'Español', ca: 'Català', en: 'English' } },
};

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;
  let session: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppShellComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    session.setUser({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      email: 'maria@example.com',
      reputationScore: 10,
      firstName: 'María',
      lastName: 'García',
    });

    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders navbar with translated links and session avatar initials', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar')).toBeTruthy();
    expect(compiled.textContent).toContain('Explorar');
    expect(compiled.textContent).toContain('Mis objetos');
    expect(compiled.textContent).toContain('Entregas');
    expect(compiled.textContent).toContain('Perfil');
    expect(compiled.textContent).toContain('Publicar');
    expect(compiled.querySelector('.navbar__logo')?.textContent?.trim()).toBe('Regálalo');
    const avatarLink = compiled.querySelector('.navbar__avatar-link');
    expect(avatarLink?.tagName).toBe('A');
    expect(compiled.querySelector('app-user-avatar')).toBeTruthy();
    expect(compiled.textContent).toContain('MG');
    expect(compiled.textContent).not.toContain('Cerrar sesión');
    expect(compiled.querySelector('.navbar__logout')).toBeNull();
  });
});
