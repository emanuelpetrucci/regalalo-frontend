import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
  Routes,
} from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { PublicProfile } from '../../../core/api/generated/models/public-profile';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import { PerfilPublicoComponent } from './perfil-publico.component';

const VALID_USER_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

const mockProfile: PublicProfile = {
  id: OTHER_USER_ID,
  firstName: 'Otro',
  lastName: 'Usuario',
  avatarUrl: null,
  reputationScore: 10,
  totalDonated: 3,
  totalReceived: 1,
  createdAt: '2025-06-15T10:00:00.000Z',
};

const testRoutes: Routes = [
  { path: 'perfil', children: [] },
  { path: 'users/:id', children: [] },
  { path: 'explorar', children: [] },
];

const esJson = {
  profile: {
    public: {
      title: 'Perfil de usuario',
      display_name_aria: 'Perfil de {{name}}',
      anonymous_user: 'Usuario anónimo',
      member_since: 'Miembro desde {{date}}',
      back: 'Volver',
      loading: 'Cargando perfil…',
      privacy_note: 'Solo información pública visible.',
      stats: {
        aria_label: 'Métricas públicas',
        commitment: 'Compromiso',
        given: 'Ha regalado',
        received: 'Ha aprovechado',
      },
      errors: {
        invalid_id: 'Identificador de usuario no válido.',
        not_found: 'No encontramos este usuario.',
        load: 'No se pudo cargar el perfil.',
        retry: 'Reintentar',
        back_explore: 'Explorar objetos',
      },
    },
  },
  reports: {
    trigger: {
      report_user: 'Reportar este usuario',
      menu_aria: 'Opciones',
    },
  },
};

function setup(
  routeId: string,
  options: {
    usersIdGet?: ReturnType<typeof vi.fn>;
    sessionUserId?: string;
    sessionEmailVerified?: boolean;
  } = {},
): {
  fixture: ReturnType<typeof TestBed.createComponent<PerfilPublicoComponent>>;
  usersIdGet: ReturnType<typeof vi.fn>;
  locationBack: ReturnType<typeof vi.fn>;
} {
  const usersIdGet =
    options.usersIdGet ?? vi.fn().mockResolvedValue(mockProfile);
  const locationBack = vi.fn();
  const sessionUser = options.sessionUserId
    ? { id: options.sessionUserId, email: 'me@test.com', reputationScore: 0, emailVerified: options.sessionEmailVerified }
    : null;

  TestBed.configureTestingModule({
    imports: [
      PerfilPublicoComponent,
      TranslocoTestingModule.forRoot({
        langs: { es: esJson },
        translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
      }),
    ],
    providers: [
      provideRouter(testRoutes),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ id: routeId })),
        },
      },
      {
        provide: UsersService,
        useValue: { usersIdGet },
      },
      {
        provide: SessionService,
        useValue: {
          getUser: () => sessionUser,
          isLoggedIn: signal(!!options.sessionUserId),
          user: signal(sessionUser).asReadonly(),
        },
      },
      {
        provide: Location,
        useValue: { back: locationBack },
      },
    ],
  });

  const fixture = TestBed.createComponent(PerfilPublicoComponent);
  fixture.detectChanges();
  return { fixture, usersIdGet, locationBack };
}

describe('PerfilPublicoComponent', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads public profile for valid UUID', async () => {
    const { fixture, usersIdGet } = setup(OTHER_USER_ID);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(usersIdGet).toHaveBeenCalledWith({ id: OTHER_USER_ID });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Otro Usuario');
    expect(el.textContent).not.toContain('Usuario anónimo');
    expect(el.textContent).toContain('Compromiso');
    expect(el.textContent).toContain('+10');
    expect(el.textContent).toContain('3');
  });

  it('shows invalid_id without API call for bad UUID', async () => {
    const usersIdGet = vi.fn();
    const { fixture } = setup('not-a-uuid', { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(usersIdGet).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Identificador de usuario no válido',
    );
  });

  it('shows not_found on 404', async () => {
    const usersIdGet = vi.fn().mockRejectedValue(
      new HttpErrorResponse({ status: 404 }),
    );
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No encontramos este usuario',
    );
  });

  it('shows invalid_id on 400', async () => {
    const usersIdGet = vi.fn().mockRejectedValue(
      new HttpErrorResponse({ status: 400 }),
    );
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Identificador de usuario no válido',
    );
  });

  it('shows negative score without clamping (NFR-F7)', async () => {
    const usersIdGet = vi.fn().mockResolvedValue({
      ...mockProfile,
      reputationScore: -5,
    });
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('-5');
    expect(fixture.nativeElement.textContent).not.toContain('+0');
  });

  it('retries after load error', async () => {
    const usersIdGet = vi
      .fn()
      .mockRejectedValueOnce(new HttpErrorResponse({ status: 500 }))
      .mockResolvedValueOnce(mockProfile);
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector(
      '.perfil-publico__retry-btn',
    ) as HTMLButtonElement;
    retryBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(usersIdGet).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('+10');
  });

  it('goBack calls Location.back when history has entries', async () => {
    const historySpy = vi.spyOn(history, 'length', 'get').mockReturnValue(2);
    const { fixture, locationBack } = setup(OTHER_USER_ID);
    await fixture.whenStable();
    fixture.detectChanges();

    const navigateSpy = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    const backBtn = fixture.nativeElement.querySelector(
      '.perfil-publico__back',
    ) as HTMLButtonElement;
    backBtn.click();

    expect(locationBack).toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    historySpy.mockRestore();
  });

  it('goBack navigates to explorar when history has no entries', async () => {
    const historySpy = vi.spyOn(history, 'length', 'get').mockReturnValue(1);
    const { fixture, locationBack } = setup(OTHER_USER_ID);
    await fixture.whenStable();
    fixture.detectChanges();

    const navigateSpy = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);

    const backBtn = fixture.nativeElement.querySelector(
      '.perfil-publico__back',
    ) as HTMLButtonElement;
    backBtn.click();
    await fixture.whenStable();

    expect(locationBack).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/explorar']);
    historySpy.mockRestore();
  });

  it('hides report trigger when viewing own profile (canReport=false)', async () => {
    const { fixture } = setup(OTHER_USER_ID, { sessionUserId: OTHER_USER_ID, sessionEmailVerified: true });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil-publico__report-link')).toBeNull();
  });

  it('shows report trigger when viewing another user and emailVerified=true', async () => {
    const { fixture } = setup(OTHER_USER_ID, { sessionUserId: VALID_USER_ID, sessionEmailVerified: true });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil-publico__report-link')).toBeTruthy();
  });

  it('hides report trigger when emailVerified is false', async () => {
    const { fixture } = setup(OTHER_USER_ID, { sessionUserId: VALID_USER_ID, sessionEmailVerified: false });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil-publico__report-link')).toBeNull();
  });

  it('shows loading skeleton while fetching', () => {
    const usersIdGet = vi.fn(() => new Promise(() => undefined));
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.perfil-publico__skeleton'),
    ).toBeTruthy();
  });

  it('falls back to anonymous_user when public profile has empty names', async () => {
    const usersIdGet = vi.fn().mockResolvedValue({
      ...mockProfile,
      firstName: '',
      lastName: '   ',
    });
    const { fixture } = setup(OTHER_USER_ID, { usersIdGet });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Usuario anónimo');
    expect(fixture.nativeElement.textContent).not.toContain('Otro Usuario');
  });

  it('redirects to private profile when viewing own id', async () => {
    const usersIdGet = vi.fn();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        PerfilPublicoComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter(testRoutes),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: VALID_USER_ID })),
          },
        },
        { provide: UsersService, useValue: { usersIdGet } },
        {
          provide: SessionService,
          useValue: {
            getUser: () => ({
              id: VALID_USER_ID,
              email: 'me@test.com',
              reputationScore: 0,
              emailVerified: true,
            }),
            isLoggedIn: signal(true),
            user: signal({ id: VALID_USER_ID, email: 'me@test.com', reputationScore: 0, emailVerified: true }).asReadonly(),
          },
        },
        { provide: Location, useValue: { back: vi.fn() } },
      ],
    }).compileComponents();

    const navigateSpy = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    const fixture = TestBed.createComponent(PerfilPublicoComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/perfil'], { replaceUrl: true });
    expect(usersIdGet).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.perfil-publico__skeleton'),
    ).toBeFalsy();
  });
});
