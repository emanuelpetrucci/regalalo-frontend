import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { GetItemResponse } from '../../../core/api/generated/models/get-item-response';
import type { MyItem } from '../../../core/api/generated/models/my-item';
import type { ItemCategory } from '../../../core/utils/item-category-label.util';
import type { MyItemsResponse } from '../../../core/api/generated/models/my-items-response';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { DeliveryService } from '../../../core/api/generated/services/delivery.service';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { environment } from '../../../../environments/environment';
import { MisObjetosComponent } from './mis-objetos.component';

const esJson = {
  delivery: {
    detail: {
      receiver_contact_channel_label: 'Cómo contactar al receptor',
      channel_unavailable: 'No disponible',
      actions: {
        confirm: 'Confirmar entrega realizada',
        cancel: 'Cancelar sesión',
      },
      errors: {
        confirm_conflict: 'Sesión ya no activa',
        cancel_conflict: 'Sesión ya cancelada',
        forbidden: 'Sin permiso',
        not_found: 'No encontrada',
        action_failed: 'Acción fallida',
      },
    },
  },
  items: {
    cancel: {
      success: 'Objeto cancelado',
      trigger: 'Cancelar objeto',
      dialog_title: 'Cancelar objeto',
      dialog_body: 'Sin sesión activa',
      dialog_title_with_session: 'Cancelar objeto y entrega',
      dialog_body_with_session: 'Se cancelará la entrega en curso.',
      confirm: 'Confirmar cancelación',
      dismiss: 'Volver',
    },
    explore: {
      distance_km: '{{km}} km',
    },
    detail: {
      loading: 'Cargando…',
      status_active: 'Disponible',
      status_reserved: 'Reservado',
      status_completed: 'Completado',
      status_cancelled: 'Cancelado',
      errors: { load_failed: 'Error', retry: 'Reintentar' },
    },
    publish: {
      condition_good: 'Buen estado',
    },
    category: {
      furniture: 'Muebles',
      electronics: 'Electrónica',
      clothing: 'Ropa y calzado',
      books: 'Libros y material educativo',
      toys: 'Juguetes',
      kitchen: 'Cocina y hogar',
      sports: 'Deporte y ocio',
      tools: 'Herramientas',
      other: 'Otro',
    },
    weight_range: {
      lt1: 'Menos de 1 kg',
      '1to5': 'Entre 1 y 5 kg',
      '5to20': 'Entre 5 y 20 kg',
      gt20: 'Más de 20 kg',
    },
    pause: { list_suffix: '· pausadas', banner_paused: 'Pausadas' },
    my_objects: {
      subtitle: 'Gestiona',
      publish_cta: 'Publicar objeto',
      loading: 'Cargando…',
      tabs_label: 'Filtros',
      tabs: {
        all: 'Todos',
        active: 'Activos',
        reserved: 'Reservados',
        completed: 'Completados',
        cancelled: 'Cancelados',
      },
      empty_title: 'Nada aquí',
      empty_body: 'Cuando publiques',
      empty_cta: 'Publicar',
      list_count_one: '1 objeto',
      list_count: '{{count}} objetos',
      select_hint: 'Selecciona',
      no_requests_yet: 'Sin solicitudes aún',
      requests_count_one: '1 solicitud',
      requests_count: '{{count}} solicitudes',
      candidates_title: 'Candidatos',
      candidates_empty: 'Vacío',
      candidates_loading: 'Cargando…',
      select: 'Seleccionar',
      select_modal_title: 'Seleccionar receptor',
      select_modal_lead: 'Lead',
      select_channel_label: 'Canal',
      select_channel_type_whatsapp: 'WhatsApp',
      select_channel_type_email: 'Email',
      select_channel_type_phone: 'Teléfono',
      select_channel_placeholder_whatsapp: 'wa',
      select_channel_placeholder_email: 'em',
      select_channel_placeholder_phone: 'ph',
      select_channel_required: 'Requerido',
      select_legal_warning: 'Legal',
      select_confirm: 'Confirmar selección',
      select_confirming: 'Confirmando',
      select_cancel: 'Cancelar',
      select_score_points: 'puntos',
      select_success: 'Éxito {{sessionId}} {{date}}',
      select_success_link: 'Ver sesión',
      select_errors: {
        conflict_pending: 'Ya no pendiente',
        generic: 'Error genérico',
      },
      close_modal: 'Cerrar modal',
      close_detail: 'Cerrar',
      select_candidate: 'Seleccionar {{rank}}',
      select_disabled_paused: 'Pausado',
      best_candidate: 'Mejor candidato',
      errors: {
        load_failed: 'Error al cargar',
        candidates_load_failed: 'Error candidatos',
        candidates_forbidden: 'Sin permiso',
        select_refresh_failed: 'No se pudo actualizar tras seleccionar',
      },
      closed_completed_title: 'Entrega completada',
      closed_completed_body: 'Gracias por contribuir',
      closed_cancelled_title: 'Cancelado',
      closed_cancelled_body: 'Ya no visible',
      days_today: 'hoy',
      days_yesterday: 'ayer',
      days_ago: 'hace {{days}}d',
      status_active: 'Activo',
      status_reserved: 'Reservado',
      status_completed: 'Completado',
      status_cancelled: 'Cancelado',
      reserved_session_title: 'Sesión activa',
      reserved_session_body: 'Expira {{date}}',
      reserved_receiver_label: 'Receptor seleccionado',
      reserved_contact_label: 'Canal facilitado',
      reserved_session_body_lead: 'Plazo de 7 días · expira el ',
      confirm_delivery: {
        action: 'Confirmar entrega realizada',
        title: '¿Confirmar entrega?',
        body_lead: 'Al confirmar,',
        body_points: '+10 puntos',
        body_tail: '.',
        dismiss: 'Cancelar',
        confirm: 'Confirmar entrega',
        confirming: 'Confirmando…',
      },
      cancel_session: {
        action: 'Cancelar sesión',
        title: 'Cancelar sesión',
        body: 'Cuerpo',
        dismiss: 'Cerrar',
        confirm: 'Cancelar sesión',
        confirming: 'Cancelando',
        no_show_title: 'El receptor no se presentó',
        no_show_body: 'Indica que no vino a recoger el objeto.',
        no_show_confirm: 'Confirmar ausencia y cancelar',
      },
    },
  },
  nav: { my_items: 'Mis objetos' },
};

function makeItem(overrides: Partial<MyItem> = {}): MyItem {
  return {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    slug: 'silla-de-oficina',
    title: 'Silla de oficina',
    condition: 'good',
    category: 'furniture',
    status: 'active',
    degradedAt: null,
    images: ['https://example.com/img.jpg'],
    createdAt: '2026-05-01T10:00:00Z',
    completedAt: null,
    requestsPaused: false,
    requestCount: 0,
    ...overrides,
  };
}

function makeDetail(overrides: Partial<GetItemResponse> = {}): GetItemResponse {
  return {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    slug: 'silla-de-oficina',
    title: 'Silla de oficina',
    condition: 'good',
    category: 'furniture',
    weightRange: '1to5',
    status: 'active',
    degradedAt: null,
    images: ['https://example.com/img.jpg'],
    createdAt: '2026-05-01T10:00:00Z',
    description: 'Descripción',
    distanceMeters: 1200,
    locationName: null,
    requestsPaused: false,
    donor: {
      id: 'donor-id',
      firstName: 'Luis',
      lastName: 'Pérez',
      avatarUrl: null,
      reputationScore: 50,
    },
    ...overrides,
  };
}

function makeResponse(items: MyItem[]): MyItemsResponse {
  return {
    items,
    pagination: { total: items.length, page: 1, limit: 50, totalPages: 1 },
  };
}

async function settle(fixture: ComponentFixture<MisObjetosComponent>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r, 0));
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('MisObjetosComponent', () => {
  let usersMeItemsGet: ReturnType<typeof vi.fn>;
  let usersMeDeliverySessionsGet: ReturnType<typeof vi.fn>;
  let itemsIdGet: ReturnType<typeof vi.fn>;
  let itemsIdRequestsGet: ReturnType<typeof vi.fn>;
  let itemsIdRequestsRequestIdSelectPost: ReturnType<typeof vi.fn>;
  let itemsIdDelete: ReturnType<typeof vi.fn>;
  let deliverySessionsIdGet: ReturnType<typeof vi.fn>;
  let deliverySessionsIdConfirmPost: ReturnType<typeof vi.fn>;
  let deliverySessionsIdCancelPost: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    usersMeItemsGet = vi.fn().mockResolvedValue(makeResponse([]));
    usersMeDeliverySessionsGet = vi.fn().mockResolvedValue({ sessions: [] });
    itemsIdGet = vi.fn().mockResolvedValue(makeDetail());
    itemsIdRequestsGet = vi.fn().mockResolvedValue({ candidates: [] });
    itemsIdRequestsRequestIdSelectPost = vi.fn().mockResolvedValue({
      sessionId: 'session-1',
      status: 'active',
      deadlineAt: '2026-05-30T12:00:00Z',
    });
    deliverySessionsIdConfirmPost = vi.fn().mockResolvedValue({
      status: 'completed',
      completedAt: '2026-05-23T12:00:00.000Z',
    });
    deliverySessionsIdCancelPost = vi.fn().mockResolvedValue({
      status: 'cancelled',
      noShowDeclared: false,
      completedAt: '2026-05-23T12:00:00.000Z',
    });
    itemsIdDelete = vi.fn().mockResolvedValue({ message: 'ok' });
    deliverySessionsIdGet = vi.fn().mockResolvedValue({
      id: 'session-1',
      itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      status: 'active',
      contactChannel: null,
      sharedContactChannel: 'Telegram: @donor',
      receiverContactChannel: 'WhatsApp: +34 600 111 222',
      deadlineAt: '2026-05-30T12:00:00.000Z',
      donorConfirmed: false,
      noShowDeclared: false,
      createdAt: '2026-05-20T12:00:00.000Z',
      completedAt: null,
      role: 'donor',
      item: { title: 'Mesa', condition: 'good', category: 'other', images: [] },
      otherParty: {
        userId: '660e8400-e29b-41d4-a716-446655440001',
        firstName: 'Ana',
        lastName: 'Receptora',
        avatarUrl: null,
        reputationScore: 120,
        distanceMeters: 1200,
      },
    });

    await TestBed.configureTestingModule({
      imports: [
        MisObjetosComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: { usersMeItemsGet, usersMeDeliverySessionsGet },
        },
        {
          provide: ItemsService,
          useValue: {
            itemsIdGet,
            itemsIdRequestsGet,
            itemsIdDelete,
            itemsIdRequestsRequestIdSelectPost,
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet,
            deliverySessionsIdConfirmPost,
            deliverySessionsIdCancelPost,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();
  });

  it('renders reserved delivery panel from prototype (receiver, channel, actions)', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    expect(deliverySessionsIdGet).toHaveBeenCalled();
    const html = fixture.nativeElement.textContent ?? '';
    expect(html).toContain('Receptor seleccionado');
    expect(html).toContain('WhatsApp: +34 600 111 222');
    expect(html).toContain('Confirmar entrega realizada');
    expect(fixture.nativeElement.querySelector('.mis-objetos__success-box')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.mis-objetos__reserved-actions app-btn:not([disabled])')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.mis-objetos__reserved-party')).toBeTruthy();
  });

  it('confirms delivery from reserved panel and shows completed state', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockResolvedValueOnce(
        makeResponse([makeItem({ status: 'completed', completedAt: '2026-05-23T12:00:00.000Z' })]),
      );
    usersMeDeliverySessionsGet
      .mockResolvedValueOnce({
        sessions: [
          {
            id: 'session-1',
            itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            deadlineAt: '2026-05-30T12:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ sessions: [] });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail({ status: 'reserved' }))
      .mockResolvedValueOnce(
        makeDetail({ status: 'completed' }),
      );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const confirmAction = fixture.nativeElement.querySelector(
      '.mis-objetos__reserved-actions app-btn',
    ) as HTMLElement;
    confirmAction.click();
    await settle(fixture);

    const dialog = fixture.nativeElement.querySelector(
      'app-delivery-session-confirm-dialog',
    );
    expect(dialog).toBeTruthy();

    fixture.componentInstance.onConfirmDelivery();
    await settle(fixture);

    expect(deliverySessionsIdConfirmPost).toHaveBeenCalledWith({ id: 'session-1' });
    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Entrega completada');
    expect(
      fixture.nativeElement.querySelector('.mis-objetos__reserved-actions'),
    ).toBeNull();
  });

  it('shows mapped error in confirm dialog on 403', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));
    deliverySessionsIdConfirmPost.mockRejectedValue(
      new HttpErrorResponse({ status: 403 }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(true);
    expect(fixture.componentInstance.confirmDeliveryErrorKey()).toBe(
      'delivery.detail.errors.forbidden',
    );
  });

  it('shows mapped error in confirm dialog on 404', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));
    deliverySessionsIdConfirmPost.mockRejectedValue(
      new HttpErrorResponse({ status: 404 }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(true);
    expect(fixture.componentInstance.confirmDeliveryErrorKey()).toBe(
      'delivery.detail.errors.not_found',
    );
  });

  it('shows mapped error in confirm dialog on 409', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));
    deliverySessionsIdConfirmPost.mockRejectedValue(
      new HttpErrorResponse({ status: 409 }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(true);
    expect(fixture.componentInstance.confirmDeliveryErrorKey()).toBe(
      'delivery.detail.errors.confirm_conflict',
    );
    expect(fixture.nativeElement.textContent).toContain('Sesión ya no activa');
  });

  it('keeps dialog open when confirm succeeds but refresh does not complete item', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]));
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(deliverySessionsIdConfirmPost).toHaveBeenCalled();
    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(true);
    expect(fixture.componentInstance.confirmDeliveryErrorKey()).toBe(
      'delivery.detail.errors.action_failed',
    );
  });

  it('cancels session from reserved panel and shows active item', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'active' })]));
    usersMeDeliverySessionsGet
      .mockResolvedValueOnce({
        sessions: [
          {
            id: 'session-1',
            itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            deadlineAt: '2026-05-30T12:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ sessions: [] });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail({ status: 'reserved' }))
      .mockResolvedValueOnce(makeDetail({ status: 'active' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const cancelButtons = fixture.nativeElement.querySelectorAll(
      '.mis-objetos__reserved-actions app-btn',
    );
    (cancelButtons[1] as HTMLElement).click();
    await settle(fixture);

    expect(
      fixture.nativeElement.querySelector('app-delivery-session-cancel-dialog'),
    ).toBeTruthy();

    await fixture.componentInstance.onCancelSessionConfirm(false);
    await settle(fixture);

    expect(deliverySessionsIdCancelPost).toHaveBeenCalledWith({
      id: 'session-1',
      body: { noShow: false },
    });
    expect(fixture.componentInstance.cancelSessionOpen()).toBe(false);
    expect(fixture.componentInstance.detail()?.status).toBe('active');
    expect(fixture.componentInstance.activeTab()).toBe('active');
    expect(
      fixture.nativeElement.querySelector('.mis-objetos__reserved-actions'),
    ).toBeNull();
  });

  it('sends noShow true when declaring no-show from cancel dialog', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'active' })]));
    usersMeDeliverySessionsGet
      .mockResolvedValueOnce({
        sessions: [
          {
            id: 'session-1',
            itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            deadlineAt: '2026-05-30T12:00:00.000Z',
          },
        ],
      })
      .mockResolvedValueOnce({ sessions: [] });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail({ status: 'reserved' }))
      .mockResolvedValueOnce(makeDetail({ status: 'active' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openCancelSessionDialog();
    await fixture.componentInstance.onCancelSessionConfirm(true);
    await settle(fixture);

    expect(deliverySessionsIdCancelPost).toHaveBeenCalledWith({
      id: 'session-1',
      body: { noShow: true },
    });
  });

  it('shows mapped error in cancel dialog on 409', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));
    deliverySessionsIdCancelPost.mockRejectedValue(
      new HttpErrorResponse({ status: 409 }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openCancelSessionDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.cancelSessionOpen()).toBe(true);
    expect(fixture.componentInstance.cancelSessionErrorKey()).toBe(
      'delivery.detail.errors.cancel_conflict',
    );
    expect(fixture.nativeElement.textContent).toContain('Sesión ya cancelada');
  });

  it('shows mapped error in cancel dialog on 403', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));
    deliverySessionsIdCancelPost.mockRejectedValue(
      new HttpErrorResponse({ status: 403 }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openCancelSessionDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.cancelSessionOpen()).toBe(true);
    expect(fixture.componentInstance.cancelSessionErrorKey()).toBe(
      'delivery.detail.errors.forbidden',
    );
  });

  it('uses default cancel dialog copy for active item (AC 3 regression)', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'active' })]),
    );
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'active' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const cancelItemButtons = [
      ...fixture.nativeElement.querySelectorAll('app-btn button'),
    ].filter((b: HTMLButtonElement) =>
      b.textContent?.includes('Cancelar objeto'),
    );
    expect(cancelItemButtons.length).toBeGreaterThanOrEqual(1);
    cancelItemButtons[0].click();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Sin sesión activa');
    expect(text).not.toContain('Se cancelará la entrega en curso.');
  });

  it('shows cancel item CTA with with_session dialog for reserved donor (AC 1–2)', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const cancelItemButtons = [
      ...fixture.nativeElement.querySelectorAll(
        '.mis-objetos__reserved-content app-btn button',
      ),
    ].filter((b: HTMLButtonElement) =>
      b.textContent?.includes('Cancelar objeto'),
    );
    expect(cancelItemButtons.length).toBe(1);

    cancelItemButtons[0].click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Cancelar objeto y entrega',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Se cancelará la entrega en curso.',
    );
  });

  it('calls itemsIdDelete from reserved panel and refreshes list (AC 1)', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockResolvedValueOnce(
        makeResponse([
          makeItem({ status: 'cancelled', title: 'Silla cancelada' }),
        ]),
      );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openCancelDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelConfirm();
    await settle(fixture);

    expect(itemsIdDelete).toHaveBeenCalledWith({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    });
    expect(fixture.componentInstance.showCancelledSuccess()).toBe(true);
    expect(
      [...fixture.nativeElement.querySelectorAll('.mis-objetos__row-title')].some(
        (el: Element) => el.textContent?.includes('Silla cancelada'),
      ),
    ).toBe(true);
  });

  it('does not show cancel item CTA when delivery session is not manageable', async () => {
    deliverySessionsIdGet.mockResolvedValue({
      id: 'session-1',
      itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      status: 'active',
      contactChannel: null,
      sharedContactChannel: null,
      deadlineAt: '2026-05-30T12:00:00.000Z',
      donorConfirmed: false,
      noShowDeclared: false,
      createdAt: '2026-05-20T12:00:00.000Z',
      completedAt: null,
      role: 'receiver',
      item: { title: 'Mesa', condition: 'good', category: 'other', images: [] },
      otherParty: {
        userId: '660e8400-e29b-41d4-a716-446655440001',
        firstName: 'Ana',
        lastName: 'Receptora',
        avatarUrl: null,
        reputationScore: 120,
        distanceMeters: 1200,
      },
    });
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'reserved' })]),
    );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'reserved' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).not.toContain('Cancelar objeto');
    expect(
      fixture.nativeElement.querySelector('.mis-objetos__reserved-actions'),
    ).toBeNull();
  });

  it('does not call cancel when session is not manageable', async () => {
    deliverySessionsIdGet.mockResolvedValue({
      id: 'session-1',
      itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      status: 'completed',
      contactChannel: null,
      sharedContactChannel: null,
      deadlineAt: '2026-05-30T12:00:00.000Z',
      donorConfirmed: true,
      noShowDeclared: false,
      createdAt: '2026-05-20T12:00:00.000Z',
      completedAt: '2026-05-22T12:00:00.000Z',
      role: 'donor',
      item: { title: 'Mesa', condition: 'good', category: 'other', images: [] },
      otherParty: {
        userId: '660e8400-e29b-41d4-a716-446655440001',
        firstName: 'Ana',
        lastName: 'Receptora',
        avatarUrl: null,
        reputationScore: 120,
        distanceMeters: 1200,
      },
    });
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'completed' })]),
    );
    itemsIdGet.mockResolvedValue(makeDetail({ status: 'completed' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openCancelSessionDialog();
    await fixture.componentInstance.onCancelSessionConfirm(false);

    expect(deliverySessionsIdCancelPost).not.toHaveBeenCalled();
    expect(fixture.componentInstance.cancelSessionOpen()).toBe(false);
  });

  it('does not call confirm when session is not manageable', async () => {
    deliverySessionsIdGet.mockResolvedValue({
      id: 'session-1',
      itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      status: 'completed',
      contactChannel: null,
      sharedContactChannel: null,
      deadlineAt: '2026-05-30T12:00:00.000Z',
      donorConfirmed: true,
      noShowDeclared: false,
      createdAt: '2026-05-20T12:00:00.000Z',
      completedAt: '2026-05-22T12:00:00.000Z',
      role: 'donor',
      item: { title: 'Mesa', condition: 'good', images: [] },
      otherParty: {
        userId: '660e8400-e29b-41d4-a716-446655440001',
        firstName: 'Ana',
        lastName: 'Receptora',
        avatarUrl: null,
        reputationScore: 120,
        distanceMeters: 1200,
      },
    });
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'completed' })]),
    );
    itemsIdGet.mockResolvedValue(
      makeDetail({ status: 'completed' }),
    );

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    await fixture.componentInstance.onConfirmDelivery();

    expect(deliverySessionsIdConfirmPost).not.toHaveBeenCalled();
    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(false);
  });

  it('renders page header and tabs', async () => {
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    expect(fixture.nativeElement.textContent).toContain('Mis objetos');
    expect(fixture.nativeElement.textContent).toContain('Todos');
    expect(fixture.nativeElement.querySelector('.mis-objetos__tabs')).toBeTruthy();
  });

  it('shows item rows without routing to /items/:id', async () => {
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('.mis-objetos__row')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('a[href*="/items/"]')).toBeNull();
  });

  it('shows translated category chip in detail panel (AC 7-f5)', async () => {
    const item = makeItem({ category: 'furniture' });
    usersMeItemsGet.mockResolvedValue(makeResponse([item]));
    itemsIdGet.mockResolvedValue(makeDetail({ category: 'furniture' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    fixture.componentInstance.selectItem(item);
    await settle(fixture);

    const detailChips = fixture.nativeElement.querySelector('.mis-objetos__detail-chips');
    expect(detailChips?.querySelector('app-item-category-chip')).toBeTruthy();
    expect(detailChips?.textContent).toContain('Muebles');
  });

  it('does not render weight range labels in list rows (AC 7-f5 DLT-004)', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([
        makeItem({ category: 'furniture' }),
      ]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).not.toContain('Entre 1 y 5');
    expect(text).not.toContain('Menos de 1 kg');
    expect(text).not.toContain('items.weight_range');
  });

  it('does not render weight range labels in inline detail panel (AC 7-f5 DLT-004)', async () => {
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem({ category: 'furniture' })]));
    itemsIdGet.mockResolvedValue(makeDetail({ category: 'furniture', weightRange: '1to5' }));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const detail = fixture.nativeElement.querySelector('.mis-objetos__detail');
    expect(detail).toBeTruthy();
    expect(
      detail?.querySelector('.mis-objetos__detail-chips app-item-category-chip'),
    ).toBeTruthy();

    const text = detail?.textContent ?? '';
    expect(text).not.toContain('Entre 1 y 5');
    expect(text).not.toContain('Menos de 1 kg');
    expect(text).not.toContain('items.weight_range');
  });

  it('opens inline detail panel on row click', async () => {
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    expect(itemsIdGet).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.mis-objetos__detail')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.mis-objetos__split--with-detail')).toBeTruthy();
  });

  it('shows paused suffix when requestsPaused is true and status is active', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ requestsPaused: true, status: 'active', requestCount: 2 })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    expect(fixture.nativeElement.textContent).toContain('· pausadas');
  });

  it('does not show paused suffix when requestCount is 0 even if requestsPaused is true', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ requestsPaused: true, status: 'active', requestCount: 0 })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    expect(fixture.nativeElement.textContent).not.toContain('· pausadas');
    expect(fixture.nativeElement.textContent).toContain('Sin solicitudes aún');
  });

  it('shows request count and icon when requestCount > 0 for active item', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'active', requestCount: 3 })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const meta = fixture.nativeElement.querySelector('.mis-objetos__row-meta-primary');
    expect(meta?.textContent).toContain('3 solicitudes');
    expect(meta?.textContent).not.toContain('Sin solicitudes aún');
    expect(meta?.querySelector('svg')).toBeTruthy();
  });

  it('shows singular form when requestCount is 1', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'active', requestCount: 1 })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const meta = fixture.nativeElement.querySelector('.mis-objetos__row-meta-primary');
    expect(meta?.textContent).toContain('1 solicitud');
  });

  it('shows no_requests_yet when requestCount is 0 for active item', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ status: 'active', requestCount: 0 })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const meta = fixture.nativeElement.querySelector('.mis-objetos__row-meta-primary');
    expect(meta?.textContent).toContain('Sin solicitudes aún');
    expect(meta?.querySelector('svg')).toBeFalsy();
  });

  it('loads ranked candidates when opening active detail', async () => {
    const ranked: RankedCandidate[] = [
      {
        requestId: 'req-1',
        userId: 'user-a',
        firstName: 'Ana',
        lastName: 'García',
        reputationScore: 90,
        distanceMeters: 1000,
        locationName: null,
        requestDate: '2026-05-20T10:00:00Z',
      },
      {
        requestId: 'req-2',
        userId: 'user-b',
        firstName: 'Luis',
        lastName: 'Pérez',
        reputationScore: 40,
        distanceMeters: 2000,
        locationName: null,
        requestDate: '2026-05-19T10:00:00Z',
      },
    ];
    itemsIdRequestsGet.mockResolvedValue({ candidates: ranked });
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    expect(itemsIdRequestsGet).toHaveBeenCalledWith({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    });
    const rows = fixture.nativeElement.querySelectorAll('app-candidate-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('+90');
    expect(rows[1].textContent).toContain('+40');
  });

  it('shows forbidden message on 403, not empty state', async () => {
    itemsIdRequestsGet.mockRejectedValue(
      new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }),
    );
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    expect(fixture.nativeElement.textContent).toContain('Sin permiso');
    expect(fixture.nativeElement.textContent).not.toContain('Vacío');
  });

  it('disables Seleccionar when requests are paused', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    itemsIdGet.mockResolvedValue(
      makeDetail({ requestsPaused: true, status: 'active' }),
    );
    usersMeItemsGet.mockResolvedValue(
      makeResponse([makeItem({ requestsPaused: true })]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const selectBtn = fixture.nativeElement.querySelector(
      'app-candidate-row button',
    ) as HTMLButtonElement;
    expect(selectBtn.disabled).toBe(true);
  });

  it('clears select modal when selecting another item', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    usersMeItemsGet.mockResolvedValue(
      makeResponse([
        makeItem({ id: 'item-1', title: 'Uno' }),
        makeItem({
          id: 'item-2',
          title: 'Dos',
          status: 'active',
        }),
      ]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const rows = fixture.nativeElement.querySelectorAll(
      '.mis-objetos__row',
    ) as NodeListOf<HTMLButtonElement>;
    rows[0].click();
    await settle(fixture);

    const selectBtn = fixture.nativeElement.querySelector(
      'app-candidate-row button',
    ) as HTMLButtonElement;
    selectBtn.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectModalCandidate()).not.toBeNull();

    rows[1].click();
    await settle(fixture);
    expect(fixture.componentInstance.selectModalCandidate()).toBeNull();
  });

  it('opens select receiver dialog when clicking Seleccionar', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    const selectBtn = fixture.nativeElement.querySelector(
      'app-candidate-row button',
    ) as HTMLButtonElement;
    selectBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectModalCandidate()).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('app-item-select-receiver-dialog'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Seleccionar receptor');
  });

  it('posts select on confirm and closes modal on success', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail())
      .mockResolvedValueOnce(
        makeDetail({ status: 'reserved' }),
      );
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem()]))
      .mockResolvedValueOnce(
        makeResponse([
          makeItem({
            status: 'reserved',
          }),
        ]),
      );
    usersMeDeliverySessionsGet.mockResolvedValue({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00Z',
        },
      ],
    });

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.onCandidateSelect({
      requestId: 'req-1',
      userId: 'user-a',
      firstName: 'Ana',
      lastName: 'García',
      reputationScore: 50,
      distanceMeters: 500,
      locationName: null,
      requestDate: '2026-05-20T10:00:00Z',
    });
    fixture.detectChanges();

    await fixture.componentInstance.onSelectConfirm('WhatsApp: 612345678');
    await settle(fixture);

    expect(itemsIdRequestsRequestIdSelectPost).toHaveBeenCalledWith({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      requestId: 'req-1',
      body: { contactChannel: 'WhatsApp: 612345678' },
    });
    expect(fixture.componentInstance.selectModalCandidate()).toBeNull();
    expect(fixture.componentInstance.selectSuccess()).not.toBeNull();
    expect(usersMeItemsGet).toHaveBeenCalledTimes(2);

    const sessionLink = fixture.nativeElement.querySelector(
      '.mis-objetos__select-success-link',
    ) as HTMLAnchorElement;
    expect(sessionLink).toBeTruthy();
    expect(sessionLink.getAttribute('href')).toContain('/entregas/session-1');
  });

  it('clears selectSuccess when selecting another item', async () => {
    const itemA = makeItem();
    const itemB = makeItem({
      id: 'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      title: 'Mesa',
    });
    usersMeItemsGet.mockResolvedValue(makeResponse([itemA, itemB]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    fixture.componentInstance.selectSuccess.set({
      sessionId: 'session-1',
      deadlineAt: '2026-05-30T12:00:00Z',
    });
    fixture.componentInstance.selectItem(itemB);
    expect(fixture.componentInstance.selectSuccess()).toBeNull();
  });

  it('shows refresh error after successful select when reload fails', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    itemsIdRequestsRequestIdSelectPost.mockResolvedValue({
      sessionId: 'session-1',
      status: 'active',
      deadlineAt: '2026-05-30T12:00:00Z',
    });
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem()]))
      .mockRejectedValueOnce(new Error('network'));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.onCandidateSelect({
      requestId: 'req-1',
      userId: 'user-a',
      firstName: 'Ana',
      lastName: 'García',
      reputationScore: 50,
      distanceMeters: 500,
      locationName: null,
      requestDate: '2026-05-20T10:00:00Z',
    });
    fixture.detectChanges();

    await fixture.componentInstance.onSelectConfirm('WhatsApp: 612345678');
    await settle(fixture);

    expect(fixture.componentInstance.selectSuccess()).not.toBeNull();
    expect(fixture.componentInstance.errorKey()).toBe(
      'items.my_objects.errors.select_refresh_failed',
    );
  });

  it('does not close detail while select is submitting', async () => {
    itemsIdRequestsGet.mockResolvedValue({ candidates: [] });
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.selectSubmitting.set(true);
    fixture.componentInstance.closeDetail();

    expect(fixture.componentInstance.selectedId()).not.toBeNull();
  });

  it('shows 409 error in modal without closing', async () => {
    itemsIdRequestsGet.mockResolvedValue({
      candidates: [
        {
          requestId: 'req-1',
          userId: 'user-a',
          firstName: 'Ana',
          lastName: 'García',
          reputationScore: 50,
          distanceMeters: 500,
          locationName: null,
          requestDate: '2026-05-20T10:00:00Z',
        },
      ],
    });
    itemsIdRequestsRequestIdSelectPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Request is not in pending state' },
      }),
    );
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.onCandidateSelect({
      requestId: 'req-1',
      userId: 'user-a',
      firstName: 'Ana',
      lastName: 'García',
      reputationScore: 50,
      distanceMeters: 500,
      locationName: null,
      requestDate: '2026-05-20T10:00:00Z',
    });
    fixture.detectChanges();

    await fixture.componentInstance.onSelectConfirm('Email: a@b.com');
    await settle(fixture);

    expect(fixture.componentInstance.selectModalCandidate()).not.toBeNull();
    expect(fixture.componentInstance.selectErrorKey()).toBe(
      'items.my_objects.select_errors.conflict_pending',
    );
    expect(fixture.nativeElement.textContent).toContain('Ya no pendiente');
  });

  it('opens detail from ?itemId= deep link after load', async () => {
    const itemId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem({ id: itemId })]));

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        MisObjetosComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: UsersService,
          useValue: { usersMeItemsGet, usersMeDeliverySessionsGet },
        },
        {
          provide: ItemsService,
          useValue: {
            itemsIdGet,
            itemsIdRequestsGet,
            itemsIdDelete: vi.fn(),
            itemsIdRequestsRequestIdSelectPost,
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet,
            deliverySessionsIdConfirmPost,
            deliverySessionsIdCancelPost,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ itemId }) },
            queryParamMap: of(convertToParamMap({ itemId })),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    expect(itemsIdGet).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.mis-objetos__detail')).toBeTruthy();
  });

  it('does not link to /items/:id/candidates', async () => {
    usersMeItemsGet.mockResolvedValue(makeResponse([makeItem()]));
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector(
      '.mis-objetos__row',
    ) as HTMLButtonElement;
    row.click();
    await settle(fixture);

    expect(fixture.nativeElement.querySelector('a[href*="/candidates"]')).toBeNull();
  });

  it('filters items when changing tab', async () => {
    usersMeItemsGet.mockResolvedValue(
      makeResponse([
        makeItem({ id: '1', title: 'Activo', status: 'active' }),
        makeItem({ id: '2', title: 'Cancelado', status: 'cancelled' }),
      ]),
    );
    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const cancelledTab = [
      ...fixture.nativeElement.querySelectorAll('.mis-objetos__tab'),
    ].find((el: Element) => el.textContent?.includes('Cancelados')) as HTMLButtonElement;
    cancelledTab.click();
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.mis-objetos__row-title');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Cancelado');
  });

  it('moves item out of reserved tab when loadPage fails after confirm (bug fix regression)', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockRejectedValueOnce(new Error('network'));
    usersMeDeliverySessionsGet.mockResolvedValueOnce({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail({ status: 'reserved' }))
      .mockResolvedValueOnce(makeDetail({ status: 'completed' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector('.mis-objetos__row') as HTMLButtonElement;
    row.click();
    await settle(fixture);

    fixture.componentInstance.openConfirmDeliveryDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    await settle(fixture);

    expect(deliverySessionsIdConfirmPost).toHaveBeenCalledWith({ id: 'session-1' });
    expect(fixture.componentInstance.activeTab()).toBe('completed');
    expect(fixture.componentInstance.confirmDeliveryOpen()).toBe(false);
    // item must NOT be in reserved list even after loadPage failed
    expect(fixture.componentInstance.items().find((i) => i.id === 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')?.status).toBe('completed');
  });

  it('moves item to active tab when loadPage fails after cancel (bug fix regression)', async () => {
    usersMeItemsGet
      .mockResolvedValueOnce(makeResponse([makeItem({ status: 'reserved' })]))
      .mockRejectedValueOnce(new Error('network'));
    usersMeDeliverySessionsGet.mockResolvedValueOnce({
      sessions: [
        {
          id: 'session-1',
          itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          deadlineAt: '2026-05-30T12:00:00.000Z',
        },
      ],
    });
    itemsIdGet
      .mockResolvedValueOnce(makeDetail({ status: 'reserved' }))
      .mockResolvedValueOnce(makeDetail({ status: 'active' }));

    const fixture = TestBed.createComponent(MisObjetosComponent);
    await settle(fixture);

    const row = fixture.nativeElement.querySelector('.mis-objetos__row') as HTMLButtonElement;
    row.click();
    await settle(fixture);

    await fixture.componentInstance.onCancelSessionConfirm(false);
    await settle(fixture);

    expect(deliverySessionsIdCancelPost).toHaveBeenCalledWith({
      id: 'session-1',
      body: { noShow: false },
    });
    expect(fixture.componentInstance.activeTab()).toBe('active');
    expect(fixture.componentInstance.cancelSessionOpen()).toBe(false);
    // item must NOT be in reserved list even after loadPage failed
    expect(fixture.componentInstance.items().find((i) => i.id === 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')?.status).toBe('active');
  });

  it('builds the share URL from the slug and falls back to id', () => {
    const fixture = TestBed.createComponent(MisObjetosComponent);
    fixture.componentInstance.detail.set(makeDetail({ slug: 'silla-de-oficina' }));
    expect(fixture.componentInstance.shareDialogUrl()).toBe(
      `${environment.siteUrl}/items/silla-de-oficina`,
    );
    fixture.componentInstance.detail.set(makeDetail({ slug: '' }));
    expect(fixture.componentInstance.shareDialogUrl()).toBe(
      `${environment.siteUrl}/items/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee`,
    );
  });
});
