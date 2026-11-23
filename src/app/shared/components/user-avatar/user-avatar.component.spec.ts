import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { UserAvatarComponent } from './user-avatar.component';

const esJson = {
  common: {
    user_avatar: { default_label: 'Avatar de usuario' },
  },
};

describe('UserAvatarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserAvatarComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
    }).compileComponents();
  });

  it('renders image when avatarUrl is provided', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.jpg');
    fixture.componentRef.setInput('firstName', 'Ana');
    fixture.componentRef.setInput('lastName', 'López');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img.user-avatar__img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('width')).toBe('40');
    expect(img.getAttribute('height')).toBe('40');
    expect(fixture.nativeElement.querySelector('.user-avatar__initials')).toBeNull();
  });

  it('renders name initials when avatarUrl is null', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('avatarUrl', null);
    fixture.componentRef.setInput('firstName', 'María');
    fixture.componentRef.setInput('lastName', 'García');
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.user-avatar__initials');
    expect(initials?.textContent?.trim()).toBe('MG');
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('falls back to userId initials when name is unavailable', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput(
      'userId',
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    );
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.user-avatar__initials');
    expect(initials?.textContent?.trim()).toBe('AA');
  });

  it('uses ariaLabel override when provided', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('userId', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    fixture.componentRef.setInput('ariaLabel', 'Perfil de usuario');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Perfil de usuario');
  });

  it('applies size host class', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('userId', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('user-avatar--sm')).toBe(true);
  });

  it('hides from assistive tech when decorative', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('userId', 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.getAttribute('role')).toBeNull();
  });

  it('hides from assistive tech when there are no initials or image', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
    expect(fixture.nativeElement.getAttribute('role')).toBeNull();
  });

  it('uses i18n default label for image without initials', () => {
    const fixture = TestBed.createComponent(UserAvatarComponent);
    fixture.componentRef.setInput('avatarUrl', 'https://example.com/avatar.jpg');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Avatar de usuario');
  });
});
