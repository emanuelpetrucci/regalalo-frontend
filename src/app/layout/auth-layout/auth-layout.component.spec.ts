import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { AuthLayoutComponent } from './auth-layout.component';

const esJson = {
  auth: {
    layout: {
      tagline: '"No lo vendo, lo regalo."',
      copy: 'Un sistema comunitario.',
      footer: 'España · 2026',
      note: 'El acceso a objetos depende de tu reputación en la comunidad.',
    },
  },
};

describe('AuthLayoutComponent', () => {
  let fixture: ComponentFixture<AuthLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AuthLayoutComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthLayoutComponent);
    fixture.detectChanges();
  });

  it('renders split grid brand panel and form card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.split-grid')).toBeTruthy();
    expect(compiled.querySelector('.brand-col__title')?.textContent).toContain(
      'Regálalo',
    );
    expect(compiled.querySelector('.form-panel__card')).toBeTruthy();
  });
});
