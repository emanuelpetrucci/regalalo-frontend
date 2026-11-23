import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { MyDeliverySession } from '../../../core/api/generated/models/my-delivery-session';
import type { MyItem } from '../../../core/api/generated/models/my-item';
import type { MyRequest } from '../../../core/api/generated/models/my-request';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import type { ReputationEvent } from '../../../core/api/generated/models/reputation-event';
import { REQUEST_WINDOW_MS } from '../../items/request-slots.util';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { LocaleService } from '../../../core/i18n/locale.service';
import { SessionService } from '../../../core/services/session.service';
import { PerfilComponent } from './perfil.component';

const esPartial = {
  nav: {
    logout: 'Cerrar sesión',
  },
  profile: {
    title: 'Mi perfil',
    loading: 'Cargando perfil…',
    member_since: 'Miembro desde {{date}}',
    stats: {
      aria_label: 'Métricas del perfil',
      reputation: 'Reputación',
      donated: 'Donados',
      received: 'Recibidos',
      no_shows: 'Ausencias',
      consecutive: '{{n}} consecutivos',
    },
    tabs: {
      aria_label: 'Secciones del perfil',
      donations: 'Donaciones',
      requests: 'Solicitudes',
      reputation: 'Reputación',
      settings: 'Configuración',
      coming_soon_donations: 'Próximamente — historial de donaciones',
      coming_soon_requests: 'Próximamente — historial de solicitudes',
      coming_soon_reputation: 'Próximamente — historial de reputación',
    },
    account: {
      title: 'Cuenta',
      email_label: 'Correo electrónico',
      postal_label: 'Código postal',
      phone_label: 'Teléfono',
      phone_empty: 'No indicado',
      language_label: 'Idioma preferido',
      language: {
        es: 'Español',
        ca: 'Catalán',
        en: 'Inglés',
      },
      email_verified_label: 'Correo verificado',
      email_verified_yes: 'Verificado',
      email_verified_no: 'Pendiente de verificación',
    },
    settings: {
      first_name_label: 'Nombre',
      last_name_label: 'Apellidos',
      avatar_url_label: 'URL del avatar',
      avatar_url_helper: 'Enlace público a tu imagen. Déjalo vacío para usar iniciales.',
      phone_label: 'Teléfono',
      postal_label: 'Código postal',
      language_label: 'Idioma preferido',
      save: 'Guardar cambios',
      saving: 'Guardando…',
      success: 'Perfil actualizado',
      postal_warning:
        'Cambiar tu código postal actualizará tu ubicación y cerrará tu sesión actual. Tendrás que volver a iniciar sesión.',
      error: {
        postal_invalid: 'Código postal no válido o no geocodificable',
        generic: 'No se pudo guardar. Inténtalo de nuevo.',
        field_invalid: 'Valor no válido',
      },
      validation: {
        first_name_min: 'Mínimo 2 caracteres',
        last_name_min: 'Mínimo 2 caracteres',
        postal_format: 'Introduce 5 dígitos',
      },
    },
    banners: {
      degraded_title: 'Tu reputación está afectando tu puesto en la lista',
      degraded_body: 'Apareces al final de los resultados para donantes.',
      new_user_title: 'Bienvenido a la comunidad',
      new_user_body: 'Tu reputación empieza en 0.',
    },
    errors: {
      load: 'No se pudo cargar tu perfil. Inténtalo de nuevo.',
      retry: 'Reintentar',
    },
    reputation: {
      total_score: 'Puntuación de reputación',
      earned: '+{{value}} ganados',
      lost: '{{value}} perdidos',
      event_delivery: 'Entrega completada',
      event_no_show: 'No se presentó a recoger',
      start_of_history: 'Inicio del historial',
      empty_title: 'Sin historial de reputación',
      empty_sub: 'Completa tu primera entrega para empezar a acumular puntuación.',
      error_load: 'No se pudo cargar el historial de reputación.',
      retry: 'Reintentar',
    },
    donations: {
      empty_title: 'Todavía no has donado ningún objeto',
      empty_sub: 'Cuando publiques algo, aparecerá aquí con su estado e historial de solicitudes.',
      empty_cta: 'Publicar objeto',
      empty_filter: 'No hay objetos en este estado.',
      error_load: 'No se pudo cargar tus donaciones.',
      retry: 'Reintentar',
      load_more: 'Cargar más',
      degraded_badge: 'degradado',
    },
    requests: {
      quota_label: 'Solicitudes este período',
      quota_used: '{{count}} de 3 usadas',
      quota_exhausted: 'Cuota agotada',
      empty_title: 'Sin solicitudes recientes',
      empty_sub: 'Tus solicitudes de objetos aparecerán aquí.',
      empty_cta: 'Explorar objetos',
      empty_filter: 'No hay solicitudes en este estado.',
      error_load: 'No se pudieron cargar tus solicitudes.',
      retry: 'Reintentar',
      load_more: 'Cargar más',
      filters_aria: 'Filtrar solicitudes por estado',
      filters: {
        all: 'Todas',
        pending: 'Pendientes',
        selected: 'Seleccionadas',
        rejected: 'No seleccionadas',
        cancelled: 'Canceladas',
      },
      status: {
        pending: 'pendiente',
        selected: 'seleccionado',
        completed: 'completado',
        rejected: 'no seleccionado',
        cancelled: 'cancelado',
      },
      delivery_link_aria: 'Ver entrega de {{title}}',
    },
  },
  items: {
    my_objects: {
      tabs_label: 'Filtrar por estado',
      tabs: {
        all: 'Todos',
        active: 'Activos',
        reserved: 'Reservados',
        completed: 'Completados',
        cancelled: 'Cancelados',
      },
      status_active: 'Activo',
      days_today: 'hoy',
      days_yesterday: 'ayer',
      days_ago: 'hace {{days}} días',
    },
    pause: {
      list_suffix: '· pausadas',
    },
    publish: {
      condition_good: 'Buen estado',
      condition_new: 'Nuevo',
      condition_like_new: 'Como nuevo',
      condition_fair: 'Aceptable',
    },
  },
};

const translocoOptions: TranslocoTestingOptions = {
  langs: { es: esPartial },
  translocoConfig: { availableLangs: ['es'], defaultLang: 'es' },
};

const mockRepEventDelivery: ReputationEvent = {
  id: '11111111-1111-4111-8111-111111111111',
  type: 'delivery_completed',
  delta: 20,
  sessionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  createdAt: '2026-05-01T10:00:00.000Z',
};

const mockRepEventNoShow: ReputationEvent = {
  id: '22222222-2222-4222-8222-222222222222',
  type: 'no_show',
  delta: -40,
  sessionId: 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
  createdAt: '2026-05-02T10:00:00.000Z',
};

function makeRequest(overrides: Partial<MyRequest> = {}): MyRequest {
  return {
    id: 'req-00000000-0000-4000-8000-000000000001',
    itemId: 'item-00000000-0000-4000-8000-000000000099',
    itemTitle: 'Silla de oficina',
    itemStatus: 'active',
    status: 'pending',
    images: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeDonationItem(overrides: Partial<MyItem> = {}): MyItem {
  return {
    id: 'cccccccc-dddd-4eee-8fff-000000000001',
    slug: 'mesa-de-comedor',
    title: 'Mesa de comedor',
    category: 'furniture',
    condition: 'good',
    status: 'active',
    degradedAt: null,
    images: ['https://example.com/thumb.jpg'],
    createdAt: '2026-05-10T10:00:00.000Z',
    completedAt: null,
    requestsPaused: false,
    requestCount: 0,
    ...overrides,
  };
}

const mockProfile: PrivateProfile = {
  id: 'a1b2c3d4-e5f6-4789-abcd-ef1234567890',
  email: 'test.user@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: null,
  avatarUrl: null,
  emailVerified: true,
  preferredLanguage: 'es',
  postalCode: '28001',
  reputationScore: 10,
  totalReceived: 2,
  totalDonated: 3,
  consecutiveNoShows: 0,
  createdAt: '2026-01-15T10:00:00.000Z',
};

describe('PerfilComponent', () => {
  let mockUsersService: {
    usersMeGet: ReturnType<typeof vi.fn>;
    usersMePatch: ReturnType<typeof vi.fn>;
    usersMeReputationHistoryGet: ReturnType<typeof vi.fn>;
    usersMeItemsGet: ReturnType<typeof vi.fn>;
    usersMeRequestsGet: ReturnType<typeof vi.fn>;
    usersMeDeliverySessionsGet: ReturnType<typeof vi.fn>;
  };
  let session: SessionService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    mockUsersService = {
      usersMeGet: vi.fn(),
      usersMePatch: vi.fn(),
      usersMeReputationHistoryGet: vi.fn().mockResolvedValue({ events: [] }),
      usersMeItemsGet: vi.fn().mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
      usersMeRequestsGet: vi.fn().mockResolvedValue({
        requests: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
      usersMeDeliverySessionsGet: vi.fn().mockResolvedValue({ sessions: [] }),
    };

    await TestBed.configureTestingModule({
      imports: [
        PerfilComponent,
        TranslocoTestingModule.forRoot(translocoOptions),
      ],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        provideRouter([]),
      ],
    }).compileComponents();

    session = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(PerfilComponent);
    fixture.detectChanges();
    return fixture;
  }

  async function openReputationTab(fixture: ReturnType<typeof createFixture>) {
    const tab = fixture.debugElement.query(By.css('#perfil-tab-reputacion'));
    tab.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function openDonationsTab(fixture: ReturnType<typeof createFixture>) {
    const tab = fixture.debugElement.query(By.css('#perfil-tab-donaciones'));
    tab.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function openRequestsTab(fixture: ReturnType<typeof createFixture>) {
    const tab = fixture.debugElement.query(By.css('#perfil-tab-solicitudes'));
    tab.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows loading state initially', () => {
    mockUsersService.usersMeGet.mockReturnValue(new Promise(() => {}));
    const fixture = createFixture();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });

  it('renders display name from firstName and lastName (not email local-part)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test User');
    expect(el.textContent).not.toContain('Test.user');
  });

  it('renders profile email and postal after successful load', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('test.user@example.com');
    expect(el.textContent).toContain('28001');
  });

  it('shows editable settings fields on configuracion tab', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#settings-first-name')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#settings-postal-code')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.perfil__settings-save')).toBeTruthy();
  });

  it('shows email verified read-only on configuracion tab', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({
      ...mockProfile,
      phone: null,
      preferredLanguage: 'es',
      emailVerified: false,
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Pendiente de verificación');
    expect(el.textContent).toContain('test.user@example.com');
  });

  it('renders positive reputationScore with + prefix and good tone', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('+10');
    expect(fixture.nativeElement.querySelector('.perfil__stat-value--good')).toBeTruthy();
  });

  it('renders zero reputationScore with muted tone (Perfil.html)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({
      ...mockProfile,
      reputationScore: 0,
      totalDonated: 1,
      totalReceived: 0,
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const scoreEl = fixture.nativeElement.querySelector('.perfil__stat-value');
    expect(scoreEl?.textContent?.trim()).toBe('0');
    expect(scoreEl?.classList.contains('perfil__stat-value--muted')).toBe(true);
    expect(scoreEl?.classList.contains('perfil__stat-value--low')).toBe(false);
  });

  it('renders negative reputationScore with real sign (not absolute)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({ ...mockProfile, reputationScore: -30 });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('-30');
    expect(text).not.toContain('+30');
  });

  it('shows consecutive no-shows subtitle when consecutiveNoShows > 0', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({ ...mockProfile, consecutiveNoShows: 2 });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('consecutivos');
  });

  it('does not show consecutive subtitle when consecutiveNoShows is 0', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({ ...mockProfile, consecutiveNoShows: 0 });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('consecutivos');
  });

  it('shows member_since text with formatted date', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Miembro desde');
    expect(fixture.nativeElement.textContent).toContain('2026');
  });

  it('shows error state with retry button on API failure', async () => {
    mockUsersService.usersMeGet.mockRejectedValue(new Error('Network error'));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="alert"]')).toBeTruthy();
    expect(el.textContent).toContain('No se pudo cargar tu perfil');
    expect(el.querySelector('.perfil__retry-btn')).toBeTruthy();
  });

  it('calls usersMeGet again when retry button clicked', async () => {
    mockUsersService.usersMeGet.mockRejectedValue(new Error('fail'));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const retryBtn = fixture.debugElement.query(By.css('.perfil__retry-btn'));
    retryBtn.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeGet).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('shows degraded banner when reputationScore < 0', async () => {
    mockUsersService.usersMeGet.mockResolvedValue({ ...mockProfile, reputationScore: -30 });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Tu reputación está afectando tu puesto en la lista',
    );
  });

  it('does not show degraded banner when reputationScore >= 0', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain(
      'Tu reputación está afectando tu puesto en la lista',
    );
  });

  it('shows new user banner when score === 0 and no activity', async () => {
    const newUser: PrivateProfile = {
      ...mockProfile,
      reputationScore: 0,
      totalDonated: 0,
      totalReceived: 0,
    };
    mockUsersService.usersMeGet.mockResolvedValue(newUser);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Bienvenido a la comunidad');
  });

  it('does not show new user banner when user has activity', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Bienvenido a la comunidad');
  });

  it('loads donations once when donaciones tab is activated', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [makeDonationItem()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledTimes(1);
    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
    expect(fixture.nativeElement.textContent).toContain('Mesa de comedor');
  });

  it('does not reload donations when switching back to donaciones tab', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [makeDonationItem()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);
    const configTab = fixture.debugElement.query(By.css('#perfil-tab-configuracion'));
    configTab.nativeElement.click();
    fixture.detectChanges();
    await openDonationsTab(fixture);

    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledTimes(1);
  });

  it('refetches donations with status when active filter is selected', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [makeDonationItem()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    const filters = fixture.nativeElement.querySelectorAll('.perfil__don-filter');
    const activeFilterBtn = Array.from(filters).find(
      (el) => (el as HTMLElement).textContent?.trim() === 'Activos',
    ) as HTMLButtonElement;
    activeFilterBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledTimes(2);
    expect(mockUsersService.usersMeItemsGet).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      status: 'active',
    });
  });

  it('shows paused suffix when requestsPaused is true and status is active', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [makeDonationItem({ requestsPaused: true, status: 'active' })],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('· pausadas');
  });

  it('normalizes unknown item category to other in donations', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [
        makeDonationItem({
          category: 'legacy_category' as MyItem['category'],
        }),
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(fixture.componentInstance.itemCategory(makeDonationItem({
      category: 'legacy_category' as MyItem['category'],
    }))).toBe('other');
  });

  it('shows degraded badge instead of status badge when degradedAt is set', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [
        makeDonationItem({
          degradedAt: '2026-04-01T10:00:00.000Z',
          status: 'active',
        }),
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(fixture.nativeElement.querySelector('.perfil__don-badge--degraded')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.perfil__don-badge--active')).toBeNull();
  });

  it('shows empty state with publish CTA when donations list is empty', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'Todavía no has donado ningún objeto',
    );
    expect(fixture.nativeElement.querySelector('.perfil__don-empty-btn')).toBeTruthy();
  });

  it('shows filter-specific empty message when filtered list is empty', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);
    const filters = fixture.nativeElement.querySelectorAll('.perfil__don-filter');
    const completedBtn = Array.from(filters).find(
      (el) => (el as HTMLElement).textContent?.trim() === 'Completados',
    ) as HTMLButtonElement;
    completedBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No hay objetos en este estado.');
  });

  it('retries donations API after error', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        items: [makeDonationItem()],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar tus donaciones');
    const retryBtn = fixture.nativeElement.querySelector('.perfil__don-error .perfil__retry-btn');
    retryBtn?.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.perfil__don-error')).toBeNull();
  });

  it('navigates to mis-objetos with itemId when donation row is clicked', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const item = makeDonationItem();
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [item],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    const card = fixture.nativeElement.querySelector('.perfil__don-card') as HTMLButtonElement;
    card.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/mis-objetos'], {
      queryParams: { itemId: item.id },
    });
  });

  it('appends items when load more is clicked', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const page1Item = makeDonationItem({ id: 'page-1-item', title: 'Objeto página 1' });
    const page2Item = makeDonationItem({
      id: 'page-2-item',
      title: 'Objeto página 2',
    });
    mockUsersService.usersMeItemsGet
      .mockResolvedValueOnce({
        items: [page1Item],
        pagination: { page: 1, limit: 20, total: 2, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        items: [page2Item],
        pagination: { page: 2, limit: 20, total: 2, totalPages: 2 },
      });

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    const loadMoreBtn = fixture.nativeElement.querySelector(
      '.perfil__don-load-more-btn',
    ) as HTMLButtonElement;
    loadMoreBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Objeto página 1');
    expect(text).toContain('Objeto página 2');
    expect(mockUsersService.usersMeItemsGet).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
    });
  });

  it('shows account section by default (configuracion tab)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Cuenta');
    expect(el.textContent).toContain('Correo electrónico');
    expect(el.textContent).toContain('Código postal');
  });

  it('shows logout control on configuracion tab (Perfil.html parity)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const logoutBtn = fixture.nativeElement.querySelector('.perfil__logout');
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn?.textContent).toContain('Cerrar sesión');
  });

  it('loads reputation history once when reputacion tab is activated', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockResolvedValue({
      events: [mockRepEventDelivery, mockRepEventNoShow],
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);

    expect(mockUsersService.usersMeReputationHistoryGet).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.textContent).toContain('Entrega completada');
    expect(fixture.nativeElement.textContent).toContain('No se presentó a recoger');
  });

  it('does not reload reputation when switching back to reputacion tab', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockResolvedValue({
      events: [mockRepEventDelivery],
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);
    const configTab = fixture.debugElement.query(By.css('#perfil-tab-configuracion'));
    configTab.nativeElement.click();
    fixture.detectChanges();
    await openReputationTab(fixture);

    expect(mockUsersService.usersMeReputationHistoryGet).toHaveBeenCalledTimes(1);
  });

  it('shows negative delta as real value on chip (NFR-F7)', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockResolvedValue({
      events: [mockRepEventNoShow],
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);

    const chip = fixture.nativeElement.querySelector('.perfil__rep-chip--neg');
    expect(chip?.textContent?.trim()).toBe('-40');
    expect(chip?.textContent).not.toContain('+40');
  });

  it('shows positive delta with + prefix on chip', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockResolvedValue({
      events: [mockRepEventDelivery],
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);

    const chip = fixture.nativeElement.querySelector('.perfil__rep-chip--pos');
    expect(chip?.textContent?.trim()).toBe('+20');
  });

  it('shows empty state when reputation events array is empty', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockResolvedValue({ events: [] });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('Sin historial de reputación');
    expect(fixture.nativeElement.querySelector('.perfil__rep-empty')).toBeTruthy();
  });

  it('shows reputation error and retries API on button click', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ events: [mockRepEventDelivery] });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openReputationTab(fixture);

    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el historial de reputación',
    );
    const retryBtn = fixture.nativeElement.querySelector('.perfil__rep-error .perfil__retry-btn');
    expect(retryBtn).toBeTruthy();
    retryBtn?.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeReputationHistoryGet).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.perfil__rep-error')).toBeNull();
  });

  it('shows reputation loading skeleton while fetching', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockReturnValue(new Promise(() => {}));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const tab = fixture.debugElement.query(By.css('#perfil-tab-reputacion'));
    tab.nativeElement.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil__rep-loading')).toBeTruthy();
  });

  it('does not duplicate reputation API call while load is in flight', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeReputationHistoryGet.mockReturnValue(new Promise(() => {}));
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const tab = fixture.debugElement.query(By.css('#perfil-tab-reputacion'));
    tab.nativeElement.click();
    tab.nativeElement.click();
    fixture.detectChanges();

    expect(mockUsersService.usersMeReputationHistoryGet).toHaveBeenCalledTimes(1);
  });

  it('loads requests once when solicitudes tab is activated', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockImplementation((params?: { status?: string }) => {
      if (params?.status === 'pending' || params?.status === 'selected') {
        return Promise.resolve({ requests: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });
      }
      return Promise.resolve({
        requests: [makeRequest()],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(mockUsersService.usersMeRequestsGet).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
    });
    expect(fixture.nativeElement.textContent).toContain('Silla de oficina');
  });

  it('does not reload requests when switching back to solicitudes tab', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [makeRequest()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);
    const initialCalls = mockUsersService.usersMeRequestsGet.mock.calls.length;
    const configTab = fixture.debugElement.query(By.css('#perfil-tab-configuracion'));
    configTab.nativeElement.click();
    fixture.detectChanges();
    await openRequestsTab(fixture);

    expect(mockUsersService.usersMeRequestsGet.mock.calls.length).toBe(initialCalls);
  });

  it('shows cancelado badge when item was cancelled by donor', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [
        makeRequest({
          status: 'pending',
          itemStatus: 'cancelled',
          itemTitle: 'Lámpara cancelada',
        }),
      ],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('cancelado');
    expect(fixture.nativeElement.querySelector('.perfil__req-badge--cancelled')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.perfil__req-filters')).toBeTruthy();
  });

  it('refetches requests with status when rejected filter is selected', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockImplementation(
      (params?: { status?: string }) => {
        if (params?.status === 'pending' || params?.status === 'selected') {
          return Promise.resolve({
            requests: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        }
        if (params?.status === 'rejected') {
          return Promise.resolve({
            requests: [makeRequest({ status: 'rejected', itemTitle: 'Objeto rechazado' })],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
          });
        }
        return Promise.resolve({
          requests: [makeRequest()],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });
      },
    );
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);
    const filters = fixture.nativeElement.querySelectorAll('.perfil__req-filter');
    const rejectedBtn = Array.from(filters).find(
      (el) => (el as HTMLElement).textContent?.trim() === 'No seleccionadas',
    ) as HTMLButtonElement;
    rejectedBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeRequestsGet).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      status: 'rejected',
    });
    expect(fixture.nativeElement.textContent).toContain('Objeto rechazado');
  });

  it('shows filter-specific empty message when filtered requests list is empty', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockImplementation(
      (params?: { status?: string }) => {
        if (params?.status === 'pending' || params?.status === 'selected') {
          return Promise.resolve({
            requests: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        }
        return Promise.resolve({
          requests: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
      },
    );
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);
    const filters = fixture.nativeElement.querySelectorAll('.perfil__req-filter');
    const rejectedBtn = Array.from(filters).find(
      (el) => (el as HTMLElement).textContent?.trim() === 'No seleccionadas',
    ) as HTMLButtonElement;
    rejectedBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No hay solicitudes en este estado.',
    );
    expect(fixture.nativeElement.querySelector('.perfil__req-empty-btn')).toBeNull();
  });

  it('shows quota card when filtered list is empty but activeCount is positive', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const inside = new Date(Date.now() - REQUEST_WINDOW_MS + 60_000).toISOString();
    const activeReq = makeRequest({ id: 'q1', status: 'pending', createdAt: inside });
    mockUsersService.usersMeRequestsGet.mockImplementation(
      (params?: { status?: string }) => {
        if (params?.status === 'pending') {
          return Promise.resolve({
            requests: [activeReq],
            pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
          });
        }
        if (params?.status === 'selected') {
          return Promise.resolve({
            requests: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        }
        if (params?.status === 'rejected') {
          return Promise.resolve({
            requests: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          });
        }
        return Promise.resolve({
          requests: [activeReq],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        });
      },
    );
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);
    const filters = fixture.nativeElement.querySelectorAll('.perfil__req-filter');
    const rejectedBtn = Array.from(filters).find(
      (el) => (el as HTMLElement).textContent?.trim() === 'No seleccionadas',
    ) as HTMLButtonElement;
    rejectedBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil__req-quota')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('1 de 3 usadas');
  });

  it('sets delivery aria-label on selected request row with receiver session', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const req = makeRequest({ status: 'selected', itemTitle: 'Mesa comedor' });
    const session: MyDeliverySession = {
      id: 'sess-00000000-0000-4000-8000-000000000077',
      itemId: req.itemId,
      itemTitle: req.itemTitle,
      itemImageUrl: null,
      role: 'receiver',
      status: 'active',
      createdAt: '2026-05-01T10:00:00.000Z',
      deadlineAt: '2026-05-08T10:00:00.000Z',
      completedAt: null,
      otherPartyUserId: 'donor-id',
      otherPartyFirstName: 'Luis',
      otherPartyLastName: 'Donante',
      otherPartyAvatarUrl: null,
    };
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [req],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockUsersService.usersMeDeliverySessionsGet.mockResolvedValue({ sessions: [session] });

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    const card = fixture.nativeElement.querySelector('.perfil__req-card') as HTMLButtonElement;
    expect(card.getAttribute('aria-label')).toContain('Mesa comedor');
  });

  it('shows quota exhausted chip when activeCount is 3 in window', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const inside = new Date(Date.now() - REQUEST_WINDOW_MS + 60_000).toISOString();
    const quotaRequests = [
      makeRequest({ id: 'q1', status: 'pending', createdAt: inside }),
      makeRequest({ id: 'q2', status: 'pending', createdAt: inside }),
      makeRequest({ id: 'q3', status: 'selected', createdAt: inside }),
    ];
    mockUsersService.usersMeRequestsGet.mockImplementation((params?: { status?: string; limit?: number }) => {
      if (params?.status === 'pending') {
        return Promise.resolve({
          requests: quotaRequests.filter((r) => r.status === 'pending'),
          pagination: { page: 1, limit: 50, total: 2, totalPages: 1 },
        });
      }
      if (params?.status === 'selected') {
        return Promise.resolve({
          requests: quotaRequests.filter((r) => r.status === 'selected'),
          pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
        });
      }
      return Promise.resolve({
        requests: quotaRequests,
        pagination: { page: 1, limit: 20, total: 3, totalPages: 1 },
      });
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('Cuota agotada');
    expect(fixture.nativeElement.querySelectorAll('.perfil__req-quota-slot--filled').length).toBe(3);
  });

  it('shows empty state with explorar CTA when requests list is empty', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('Sin solicitudes recientes');
    expect(fixture.nativeElement.querySelector('.perfil__req-empty-btn')).toBeTruthy();
  });

  it('retries requests API after error', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    let listAttempts = 0;
    mockUsersService.usersMeRequestsGet.mockImplementation((params?: { status?: string }) => {
      if (params?.status === 'pending' || params?.status === 'selected') {
        return Promise.resolve({
          requests: [],
          pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
        });
      }
      listAttempts += 1;
      if (listAttempts === 1) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        requests: [makeRequest()],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('No se pudieron cargar tus solicitudes');
    const retryBtn = fixture.nativeElement.querySelector('.perfil__req-error .perfil__retry-btn');
    retryBtn?.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMeRequestsGet.mock.calls.length).toBeGreaterThan(1);
    expect(fixture.nativeElement.querySelector('.perfil__req-error')).toBeNull();
  });

  it('opens item detail modal when pending request row is clicked', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const req = makeRequest({ status: 'pending' });
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [req],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    const card = fixture.nativeElement.querySelector('.perfil__req-card') as HTMLButtonElement;
    card.click();
    fixture.detectChanges();

    expect(navigateSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('app-item-detail-modal')).not.toBeNull();
  });

  it('shows completed badge when selected request has completed delivery session', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const req = makeRequest({ status: 'selected', itemStatus: 'reserved' });
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [req],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockUsersService.usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'sess-completed',
          itemId: req.itemId,
          itemTitle: req.itemTitle,
          role: 'receiver',
          status: 'completed',
          createdAt: '2026-05-01T10:00:00.000Z',
          deadlineAt: '2026-05-08T10:00:00.000Z',
          completedAt: '2026-05-07T10:00:00.000Z',
          otherPartyUserId: 'donor-id',
          otherPartyFirstName: 'Luis',
          otherPartyLastName: 'Donante',
          otherPartyAvatarUrl: null,
          itemImageUrl: null,
        },
      ],
    });

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    expect(fixture.nativeElement.textContent).toContain('completado');
    expect(
      fixture.nativeElement.querySelector('.perfil__req-badge--completed'),
    ).not.toBeNull();
  });

  it('renders request thumbnail when images are provided', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const req = makeRequest({
      images: ['https://example.com/item-thumb.jpg'],
    });
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [req],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    const img = fixture.nativeElement.querySelector(
      '.perfil__req-thumb img',
    ) as HTMLImageElement | null;
    expect(img).not.toBeNull();
    expect(img?.getAttribute('ng-img')).toBe('true');
  });

  it('navigates to entregas when selected request has receiver session', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const req = makeRequest({ status: 'selected' });
    const session: MyDeliverySession = {
      id: 'sess-00000000-0000-4000-8000-000000000077',
      itemId: req.itemId,
      itemTitle: req.itemTitle,
      itemImageUrl: null,
      role: 'receiver',
      status: 'active',
      createdAt: '2026-05-01T10:00:00.000Z',
      deadlineAt: '2026-05-08T10:00:00.000Z',
      completedAt: null,
      otherPartyUserId: 'donor-id',
      otherPartyFirstName: 'Luis',
      otherPartyLastName: 'Donante',
      otherPartyAvatarUrl: null,
    };
    mockUsersService.usersMeRequestsGet.mockResolvedValue({
      requests: [req],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mockUsersService.usersMeDeliverySessionsGet.mockResolvedValue({ sessions: [session] });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    const card = fixture.nativeElement.querySelector('.perfil__req-card') as HTMLButtonElement;
    card.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/entregas', session.id]);
  });

  it('appends requests when load more is clicked', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const page1 = makeRequest({ id: 'page-1', itemTitle: 'Objeto página 1' });
    const page2 = makeRequest({ id: 'page-2', itemTitle: 'Objeto página 2' });
    mockUsersService.usersMeRequestsGet.mockImplementation(
      (params?: { status?: string; page?: number }) => {
        if (params?.status === 'pending' || params?.status === 'selected') {
          return Promise.resolve({
            requests: [],
            pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
          });
        }
        if (params?.page === 2) {
          return Promise.resolve({
            requests: [page2],
            pagination: { page: 2, limit: 20, total: 2, totalPages: 2 },
          });
        }
        return Promise.resolve({
          requests: [page1],
          pagination: { page: 1, limit: 20, total: 2, totalPages: 2 },
        });
      },
    );

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openRequestsTab(fixture);

    const loadMoreBtn = fixture.nativeElement.querySelector(
      '.perfil__req-load-more-btn',
    ) as HTMLButtonElement;
    loadMoreBtn.click();
    await fixture.whenStable();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Objeto página 1');
    expect(text).toContain('Objeto página 2');
  });

  it('still loads donations with one items call when donaciones tab is used', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMeItemsGet.mockResolvedValue({
      items: [makeDonationItem()],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    await openDonationsTab(fixture);

    expect(mockUsersService.usersMeItemsGet).toHaveBeenCalledTimes(1);
  });

  it('logout clears session and navigates to /login', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    session.setToken('jwt.test');
    session.setUser({ id: 'u1', email: 'test@example.com', reputationScore: 0 });
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const logoutBtn = fixture.debugElement.query(By.css('.perfil__logout'));
    logoutBtn.nativeElement.click();

    expect(session.getToken()).toBeNull();
    expect(session.getUser()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('shows postal warning when postal code differs from profile', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ postalCode: '08001' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.perfil__postal-warning')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'Cambiar tu código postal actualizará tu ubicación',
    );
  });

  it('PATCHes preferredLanguage ca and syncs LocaleService', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMePatch.mockResolvedValue({
      ...mockProfile,
      preferredLanguage: 'ca',
    });
    const locale = TestBed.inject(LocaleService);
    const setLocaleSpy = vi.spyOn(locale, 'setLocale');

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ preferredLanguage: 'ca' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    await component.saveSettings();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMePatch).toHaveBeenCalledWith({
      body: { preferredLanguage: 'ca' },
    });
    expect(setLocaleSpy).toHaveBeenCalledWith('ca');
    expect(localStorage.getItem('rgl_locale')).toBe('ca');
    expect(component.settingsForm.controls.preferredLanguage.value).toBe('ca');
  });

  it('disables save when form is dirty but values match profile', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ firstName: 'Changed' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    const saveBtn = fixture.nativeElement.querySelector(
      '.perfil__settings-save',
    ) as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);

    component.settingsForm.patchValue({ firstName: mockProfile.firstName });
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    expect(saveBtn.disabled).toBe(true);
    expect(component.canSaveSettings()).toBe(false);
  });

  it('does not include postalCode in PATCH body when unchanged', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMePatch.mockResolvedValue({
      ...mockProfile,
      firstName: 'Updated',
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ firstName: 'Updated' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    await component.saveSettings();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMePatch).toHaveBeenCalledWith({
      body: { firstName: 'Updated' },
    });
  });

  it('calls usersMePatch with postalCode when changed and sets relogin flag', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMePatch.mockResolvedValue({
      ...mockProfile,
      postalCode: '08001',
    });
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ postalCode: '08001' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    await component.saveSettings();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(mockUsersService.usersMePatch).toHaveBeenCalledWith({
      body: { postalCode: '08001' },
    });
    expect(sessionStorage.getItem('rgl_relogin_return')).toBe('/perfil');
  });

  it('updates display name after successful name PATCH', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMePatch.mockResolvedValue({
      ...mockProfile,
      firstName: 'Nuevo',
      lastName: 'Nombre',
    });
    session.setUser({
      id: mockProfile.id,
      email: mockProfile.email,
      reputationScore: mockProfile.reputationScore,
      firstName: mockProfile.firstName,
      lastName: mockProfile.lastName,
    });

    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ firstName: 'Nuevo', lastName: 'Nombre' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    await component.saveSettings();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nuevo Nombre');
    expect(session.getUser()?.firstName).toBe('Nuevo');
  });

  it('maps postal 400 error to field without resetting form', async () => {
    mockUsersService.usersMeGet.mockResolvedValue(mockProfile);
    mockUsersService.usersMePatch.mockRejectedValue(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Error de geocodificación del código postal' },
      }),
    );
    const fixture = createFixture();
    await fixture.whenStable();
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.settingsForm.patchValue({ firstName: 'Changed', postalCode: '99999' });
    component.settingsForm.markAsDirty();
    component.settingsForm.updateValueAndValidity();
    fixture.detectChanges();

    await component.saveSettings();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.settingsForm.controls.firstName.value).toBe('Changed');
    expect(fixture.nativeElement.textContent).toContain(
      'Código postal no válido o no geocodificable',
    );
  });
});
