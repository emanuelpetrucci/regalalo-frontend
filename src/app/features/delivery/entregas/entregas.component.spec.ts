import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { MyDeliverySession } from '../../../core/api/generated/models/my-delivery-session';
import { DeliveryService } from '../../../core/api/generated/services/delivery.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { EntregasComponent } from './entregas.component';

const SESSION_ID = '11111111-2222-4333-8444-555555555555';

const OTHER_USER_ID = '660e8400-e29b-41d4-a716-446655440001';

const mockListSession: MyDeliverySession = {
  id: SESSION_ID,
  itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  itemTitle: 'Mesa escritorio',
  itemImageUrl: null,
  role: 'donor',
  status: 'active',
  deadlineAt: '2026-05-30T12:00:00.000Z',
  createdAt: '2026-05-20T12:00:00.000Z',
  completedAt: null,
  otherPartyUserId: OTHER_USER_ID,
  otherPartyFirstName: 'Ana',
  otherPartyLastName: 'Receptora',
  otherPartyAvatarUrl: null,
};

const mockReceiverSession: MyDeliverySession = {
  ...mockListSession,
  role: 'receiver',
};

const mockDetailSession = {
  id: SESSION_ID,
  itemId: mockListSession.itemId,
  status: 'active' as const,
  contactChannel: null,
  sharedContactChannel: 'WhatsApp: +34 600 111 222',
  deadlineAt: mockListSession.deadlineAt,
  donorConfirmed: false,
  noShowDeclared: false,
  createdAt: mockListSession.createdAt,
  completedAt: null,
  role: 'donor' as const,
  item: {
    title: 'Mesa escritorio',
    condition: 'good' as const,
    category: 'other' as const,
    images: [],
  },
  otherParty: {
    userId: '660e8400-e29b-41d4-a716-446655440001',
    firstName: 'Ana',
    lastName: 'Receptora',
    avatarUrl: null,
    reputationScore: 120,
    distanceMeters: 1200,
  },
};

function paginated(sessions: MyDeliverySession[], total?: number) {
  const count = total ?? sessions.length;
  return {
    sessions,
    pagination: { page: 1, limit: 50, total: count, totalPages: 1 },
  };
}

const esJson = {
  delivery: {
    list: {
      title: 'Entregas',
      subtitle: 'Sigue el estado',
      tabs_label: 'Rol',
      tab_donor: 'Como donante',
      tab_receiver: 'Como receptor',
      loading: 'Cargando…',
      section_active: 'Activas',
      section_history: 'Historial',
      empty_title: 'Sin entregas',
      empty_body: 'Cuando se active',
      select_hint: 'Selecciona una sesión',
      count_one: '1 sesión',
      count: '{{count}} sesiones',
      deadline_last_day: 'Último día',
      deadline_days: '{{days}}d',
      row_as_donor: '{{title}}, donante',
      row_as_receiver: '{{title}}, receptor',
      errors: { load_failed: 'Error listado' },
    },
    detail: {
      loading: 'Cargando sesión…',
      role_donor: 'Donante',
      role_receiver: 'Receptor',
      close_detail: 'Cerrar',
      channel_unavailable: 'No disponible',
      deadline_one_day: '1 día',
      deadline_expires: 'vence {{date}}',
      other_receiver: 'Receptor',
      steps_title: 'Estado',
      step_donor_selected: 'Sel',
      step_donor_active: 'Activa',
      step_donor_completed: 'Hecha',
      actions: { confirm: 'Confirmar', cancel: 'Cancelar' },
      errors: {
        title: 'Error',
        not_found: 'No encontrada',
        back: 'Volver',
      },
    },
  },
  items: {
    explore: { distance_km: '{{km}} km' },
    publish: { condition_good: 'Buen estado' },
    my_objects: {
      confirm_delivery: {
        title: '¿Confirmar?',
        body_lead: 'Al confirmar',
        body_points: '+10',
        body_tail: '.',
        dismiss: 'Cancelar',
        confirm: 'Confirmar',
        confirming: 'Confirmando',
      },
    },
  },
};

function createListMock(
  options: {
    donorSessions?: MyDeliverySession[];
    receiverSessions?: MyDeliverySession[];
    donorActiveTotal?: number;
    receiverActiveTotal?: number;
  } = {},
) {
  const {
    donorSessions = [mockListSession],
    receiverSessions = [],
    donorActiveTotal = donorSessions.filter((s) => s.status === 'active').length,
    receiverActiveTotal = receiverSessions.filter((s) => s.status === 'active')
      .length,
  } = options;

  return vi.fn().mockImplementation(
    (params?: { role?: string; status?: string; page?: number }) => {
      if ((params?.page ?? 1) > 1) {
        return Promise.resolve(paginated([]));
      }
      if (params?.status === 'active') {
        const total =
          params.role === 'receiver' ? receiverActiveTotal : donorActiveTotal;
        return Promise.resolve(paginated([], total));
      }
      if (params?.role === 'receiver') {
        return Promise.resolve(paginated(receiverSessions));
      }
      return Promise.resolve(paginated(donorSessions));
    },
  );
}

describe('EntregasComponent', () => {
  let usersMeDeliverySessionsGet: ReturnType<typeof vi.fn>;
  let deliverySessionsIdGet: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigate = vi.fn().mockResolvedValue(true);
    usersMeDeliverySessionsGet = vi.fn().mockImplementation(
      (params?: { role?: string; status?: string; page?: number }) => {
        const page = params?.page ?? 1;
        const pagination = { page, limit: 50, total: 1, totalPages: 1 };
        if (params?.status === 'active') {
          return Promise.resolve({
            sessions: [],
            pagination: {
              ...pagination,
              limit: 1,
              total: params.role === 'receiver' ? 0 : 1,
            },
          });
        }
        if (page > 1) {
          return Promise.resolve({ sessions: [], pagination });
        }
        return Promise.resolve({
          sessions: params?.role === 'receiver' ? [] : [mockListSession],
          pagination,
        });
      },
    );
    deliverySessionsIdGet = vi.fn().mockResolvedValue(mockDetailSession);

    await TestBed.configureTestingModule({
      imports: [
        EntregasComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({}) },
          },
        },
        {
          provide: UsersService,
          useValue: { usersMeDeliverySessionsGet },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet,
            deliverySessionsIdConfirmPost: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders title and session list', async () => {
    const fixture = TestBed.createComponent(EntregasComponent);
    fixture.detectChanges();
    await vi.waitUntil(() => !fixture.componentInstance.loading(), {
      timeout: 2000,
    });
    fixture.detectChanges();

    expect(usersMeDeliverySessionsGet).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Entregas');
    expect(fixture.nativeElement.textContent).toContain('Mesa escritorio');
    expect(fixture.nativeElement.querySelector('app-user-avatar')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Selecciona una sesión');
    expect(
      fixture.nativeElement.querySelector('.entregas__split--with-detail'),
    ).toBeNull();
  });

  it('opens detail panel on row click', async () => {
    const fixture = TestBed.createComponent(EntregasComponent);
    fixture.detectChanges();
    await vi.waitUntil(() => !fixture.componentInstance.loading(), {
      timeout: 2000,
    });
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector(
      '.entregas__session-row',
    ) as HTMLButtonElement;
    row.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.entregas__split--with-detail'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('app-entrega-detalle'),
    ).toBeTruthy();
    expect(deliverySessionsIdGet).toHaveBeenCalledWith({ id: SESSION_ID });
  });

  it('preselects session from route param /entregas/:id', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        EntregasComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: SESSION_ID })),
            snapshot: { paramMap: convertToParamMap({ id: SESSION_ID }) },
          },
        },
        {
          provide: UsersService,
          useValue: { usersMeDeliverySessionsGet: createListMock() },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet,
            deliverySessionsIdConfirmPost: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EntregasComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedSessionId()).toBe(SESSION_ID);
    expect(
      fixture.nativeElement.querySelector('.entregas__split--with-detail'),
    ).toBeTruthy();
    expect(deliverySessionsIdGet).toHaveBeenCalled();
  });

  it('switches to receiver tab when deep link targets a receiver session', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        EntregasComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: Router, useValue: { navigate } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: SESSION_ID })),
          },
        },
        {
          provide: UsersService,
          useValue: {
            usersMeDeliverySessionsGet: createListMock({
              donorSessions: [],
              receiverSessions: [mockReceiverSession],
            }),
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet: vi.fn().mockResolvedValue({
              ...mockDetailSession,
              role: 'receiver',
            }),
            deliverySessionsIdConfirmPost: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EntregasComponent);
    fixture.detectChanges();
    await vi.waitUntil(
      () => fixture.componentInstance.activeRole() === 'receiver',
      { timeout: 2000 },
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.activeRole()).toBe('receiver');
    expect(fixture.componentInstance.selectedSessionId()).toBe(SESSION_ID);
    expect(
      fixture.nativeElement.querySelector('.entregas__split--with-detail'),
    ).toBeTruthy();
  });

  it('rejects invalid route id and clears selection', async () => {
    TestBed.resetTestingModule();
    const navigateInvalid = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [
        EntregasComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        { provide: Router, useValue: { navigate: navigateInvalid } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'not-a-uuid' })),
          },
        },
        {
          provide: UsersService,
          useValue: { usersMeDeliverySessionsGet },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet,
            deliverySessionsIdConfirmPost: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EntregasComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedSessionId()).toBeNull();
    expect(navigateInvalid).toHaveBeenCalledWith(['/entregas'], { replaceUrl: true });
  });

  it('navigates to /entregas when closing detail panel', async () => {
    const fixture = TestBed.createComponent(EntregasComponent);
    const navigateSpy = navigate;

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.selectSession(mockListSession);
    fixture.detectChanges();
    await fixture.whenStable();

    const panel = fixture.debugElement.query(By.css('app-entrega-detalle'));
    panel.componentInstance.onClosePanel();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/entregas']);
    expect(fixture.componentInstance.selectedSessionId()).toBeNull();
  });
});
