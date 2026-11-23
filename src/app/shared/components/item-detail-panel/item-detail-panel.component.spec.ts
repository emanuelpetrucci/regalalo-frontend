import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { GetItemResponse } from '../../../core/api/generated/models/get-item-response';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import { environment } from '../../../../environments/environment';
import { ItemDetailPanelComponent } from './item-detail-panel.component';
import { ItemSeoService } from '../../../core/seo/item-seo.service';

const DONOR_ID = 'donor-111';
const OTHER_USER_ID = 'other-222';

const mockItem: GetItemResponse = {
  id: 'item-aaa',
  slug: 'mesa-de-madera',
  title: 'Mesa de madera',
  description: 'Mesa en buen estado',
  condition: 'good',
  category: 'furniture',
  weightRange: '5to20',
  status: 'active',
  requestsPaused: false,
  images: [],
  createdAt: '2026-01-01T00:00:00Z',
  degradedAt: null,
  distanceMeters: 3000,
  locationName: null,
  donor: { id: DONOR_ID, firstName: 'Dona', lastName: 'Nte', avatarUrl: null, reputationScore: 10 },
};

const minimalI18n = {
  items: {
    detail: {
      loading: 'Cargando…',
      not_found_title: 'No encontrado',
      not_found_body: 'No existe',
      back: 'Volver',
      section_description: 'Descripción',
      section_donor_manage: 'Gestionar',
      section_request: 'Solicitar',
      close: 'Cerrar',
      share_object: 'Compartir',
      stat_requests: 'Solicitudes',
      stat_published: 'Publicado',
      view_candidates: 'Ver candidatos ({{count}})',
      hide_candidates: 'Ocultar candidatos',
      candidates_title: 'Candidatos',
      candidates_ranked_hint: 'Ordenados por reputación',
      candidates_empty: 'Sin solicitudes',
      receiver_paused_notice: 'Solicitudes pausadas',
      donor_anonymous: 'Donante anónimo',
      status_active: 'Disponible',
      status_reserved: 'Reservado',
      status_completed: 'Completado',
      status_cancelled: 'Cancelado',
      status_degraded: 'Antiguo',
      status_paused: 'Pausado',
      published_days_ago: 'hace {{days}} días',
      days_ago: 'hace {{days}} días',
      photo_of: '{{current}} de {{total}}',
      gallery_prev: 'Anterior',
      gallery_next: 'Siguiente',
      gallery_thumbs: 'Miniaturas',
      gallery_thumb: 'Foto {{n}}',
      donor_label: 'Donante',
      manage_in_my_items: 'Gestionar',
      reputation_good: 'Alta',
      reputation_fair: 'Media',
      reputation_low: 'Baja',
      degraded_notice: 'Lleva tiempo',
      cta_interested: 'Me interesa',
      cta_paused_title: 'Pausado',
      cta_paused_body: 'Solicitudes pausadas',
      cta_unavailable: 'No disponible',
      donor_manage_hint: 'Gestiona desde Mis objetos',
      not_found_title_2: 'No encontrado',
      not_found_body_2: 'No existe',
      errors: { load_failed: 'Error al cargar', retry: 'Reintentar' },
    },
    explore: { distance_km: '{{km}} km', degraded_badge: 'antiguo', image_alt: 'Foto de {{title}}' },
    cancel: { trigger: 'Cancelar', dialog_title: 'Cancelar', dialog_body: '', confirm: 'Confirmar', confirming: 'Cancelando…', dismiss: 'Volver', dialog_title_with_session: 'Cancelar', dialog_body_with_session: '', errors: { forbidden: 'Error', not_found: 'No encontrado', generic: 'Error', connection: 'Error' }, success: 'Cancelado' },
    pause: { title: 'Pausar', subtitle_active: 'Activo', subtitle_paused: 'Pausado', banner_paused: 'Pausado', list_suffix: ' · pausado', not_available: 'No disponible', errors: { forbidden: 'Error', not_found: 'No encontrado', not_active: 'No activo', generic: 'Error', connection: 'Error' } },
    share: { title: 'Compartir', open: 'Compartir', close: 'Cerrar', copy: 'Copiar', copied: 'Copiado', network_whatsapp: 'WhatsApp', network_facebook: 'Facebook', network_twitter: 'X', default_text: 'Compartir', item_text: '{{title}}' },
    request: {
      contact_sheet: { title: 'Contacto', subtitle: 'Canal', cta_submit: 'Enviar', cta_cancel: 'Cancelar' },
      contact_step: { title: 'Contacto', lead_before: '', lead_emphasis: '', lead_after: '', back: 'Atrás', submit: 'Enviar' },
      contact_channel: { label: 'Canal', placeholder: 'Canal', hint: '', error: { required: 'Requerido' } },
      slots_remaining_lead: 'Te quedan ',
      slots_remaining_tail: ' turnos',
      slot_label_one: 'turno',
      slot_label_other: 'turnos',
      slots_confirm_use: 'Usarás ',
      slots_confirm_of_one: ' de tu ',
      slots_confirm_of_other: ' de tus ',
      slots_confirm_slot_one: 'turno',
      slots_confirm_slot_other: 'turnos',
      dialog_title: 'Confirmar',
      dialog_body: 'Confirmar',
      confirm: 'Confirmar',
      confirming: 'Enviando…',
      dismiss: 'Cancelar',
      pending_title: 'Enviado',
      pending_body: 'Esperando',
      pending_contact_label: 'Canal',
      pending_contact_edit: 'Editar',
      pending_step_sent: 'Enviado',
      pending_step_waiting: 'Esperando',
      pending_step_contact: 'Contacto',
      limit_title: 'Límite',
      errors: { own_item: 'Error', duplicate: 'Error', limit_reached: 'Error', paused: 'Error', generic: 'Error', connection: 'Error' },
    },
    my_objects: {
      select_success: 'Seleccionado',
      delivery_errors: { generic: 'Error' },
      errors: { candidates_load_failed: 'Error', candidates_forbidden: 'Error', select_refresh_failed: 'Error', load_failed: 'Error' },
      select_modal_title: 'Seleccionar',
      select_modal_lead: 'Seleccionar receptor',
      select_channel_label: 'Canal',
      select_channel_type_whatsapp: 'WhatsApp',
      select_channel_type_phone: 'Teléfono',
      select_channel_type_telegram: 'Telegram',
      select_channel_type_email: 'Email',
      select_channel_placeholder_whatsapp: '',
      select_channel_placeholder_phone: '',
      select_channel_placeholder_telegram: '',
      select_channel_placeholder_email: '',
      select_channel_required: 'Error',
      select_legal_warning: '',
      select_confirm: 'Confirmar',
      select_confirming: 'Confirmando…',
      select_cancel: 'Cancelar',
      select_score_points: 'pts',
      select_errors: { validation: 'Error', forbidden: 'Error', not_found: 'Error', conflict_pending: 'Error', conflict_active: 'Error', conflict_generic: 'Error', generic: 'Error' },
      reserved_session_title: 'Sesión activa',
      reserved_session_body: 'Plazo de 7 días · expira el {{date}}',
      reserved_session_body_lead: 'Plazo de 7 días · expira el ',
      reserved_receiver_label: 'Receptor',
      reserved_contact_label: 'Canal',
      confirm_delivery: { action: 'Confirmar', title: 'Confirmar', body_lead: '', body_points: '+10 puntos', body_tail: '', dismiss: 'Cancelar', confirm: 'Confirmar', confirming: 'Confirmando…' },
      cancel_session: { action: 'Cancelar', title: 'Cancelar', body: '', no_show_title: 'No acudió', no_show_body: '', no_show_confirm: 'Confirmar', dismiss: 'Volver', confirm: 'Cancelar', confirming: 'Cancelando…' },
      select_hint: 'Seleccionar',
      close_detail: 'Cerrar',
      select_candidate: 'Seleccionar {{rank}}',
      select_disabled_paused: 'No disponible',
      close_modal: 'Cerrar',
      candidates_title: 'Candidatos',
      candidates_loading: 'Cargando…',
      candidates_empty: 'Sin candidatos',
      best_candidate: 'Mejor candidato',
      select: 'Seleccionar',
    },
  },
  nav: { my_items: 'Mis objetos' },
  reports: {
    trigger: {
      report_item_full: 'Reportar este objeto',
      report_item: 'Reportar objeto',
      report_user: 'Reportar este usuario',
      menu_aria: 'Opciones',
    },
  },
};

function makeItemsServiceMock(item: GetItemResponse | null = mockItem) {
  return {
    itemsIdGet: item ? vi.fn().mockResolvedValue(item) : vi.fn().mockRejectedValue({ status: 404 }),
    itemsIdRequestsGet: vi.fn().mockResolvedValue({ candidates: [] }),
    itemsIdRequestsPost: vi.fn(),
    itemsIdRequestsRequestIdSelectPost: vi.fn(),
    itemsIdDelete: vi.fn(),
  };
}

function makeSessionMock(userId: string | null, emailVerified = true) {
  const user = userId ? { id: userId, email: 'u@test.com', reputationScore: 0, emailVerified } : null;
  return {
    isLoggedIn: signal(!!userId),
    user: signal(user).asReadonly(),
    getUser: () => user,
  };
}

async function createPanel(
  sessionUserId: string | null,
  emailVerified = true,
  item = mockItem,
) {
  const itemsService = makeItemsServiceMock(item);
  const usersService = { usersMeRequestsGet: vi.fn().mockResolvedValue({ requests: [] }) };

  TestBed.configureTestingModule({
    imports: [
      ItemDetailPanelComponent,
      TranslocoTestingModule.forRoot({
        langs: { es: minimalI18n },
        translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
      }),
    ],
    providers: [
      provideRouter([]),
      { provide: ItemsService, useValue: itemsService },
      { provide: UsersService, useValue: usersService },
      { provide: SessionService, useValue: makeSessionMock(sessionUserId, emailVerified) },
    ],
  });

  const fixture = TestBed.createComponent(ItemDetailPanelComponent);
  fixture.componentRef.setInput('itemId', mockItem.id);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('ItemDetailPanelComponent — canReport', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('hides report trigger when user is the donor (isDonor=true)', async () => {
    const fixture = await createPanel(DONOR_ID, true);
    expect(fixture.nativeElement.querySelector('.item-detail-panel__report-link')).toBeNull();
  });

  it('shows report trigger when user is not donor and emailVerified=true', async () => {
    const fixture = await createPanel(OTHER_USER_ID, true);
    expect(fixture.nativeElement.querySelector('.item-detail-panel__report-link')).toBeTruthy();
  });

  it('hides report trigger when emailVerified=false', async () => {
    const fixture = await createPanel(OTHER_USER_ID, false);
    expect(fixture.nativeElement.querySelector('.item-detail-panel__report-link')).toBeNull();
  });

  it('hides report trigger when not logged in', async () => {
    const fixture = await createPanel(null);
    expect(fixture.nativeElement.querySelector('.item-detail-panel__report-link')).toBeNull();
  });
});

describe('ItemDetailPanelComponent — canonical redirect', () => {
  const uuid = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

  function uuidItem(): GetItemResponse {
    return { ...mockItem, id: uuid, slug: 'mesa-de-madera' };
  }

  async function mount(presentation: 'page' | 'modal', failNavigation = false) {
    const item = uuidItem();
    const itemsService = makeItemsServiceMock(item);
    TestBed.configureTestingModule({
      imports: [
        ItemDetailPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: minimalI18n },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: ItemsService, useValue: itemsService },
        { provide: UsersService, useValue: { usersMeRequestsGet: vi.fn().mockResolvedValue({ requests: [] }) } },
        { provide: SessionService, useValue: makeSessionMock(null) },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    if (failNavigation) {
      navigate.mockRejectedValue(new Error('navigation failed'));
    } else {
      navigate.mockResolvedValue(true);
    }
    const fixture = TestBed.createComponent(ItemDetailPanelComponent);
    fixture.componentRef.setInput('presentation', presentation);
    fixture.componentRef.setInput('itemId', uuid);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, itemsService, navigate };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not leave the host page when a modal is opened with a UUID', async () => {
    const { fixture, navigate } = await mount('modal');
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.componentInstance.item()?.slug).toBe('mesa-de-madera');
  });

  it('redirects a page opened with a UUID and does not fetch again for the slug', async () => {
    const { fixture, itemsService, navigate } = await mount('page');
    expect(navigate).toHaveBeenCalledWith(['/items', 'mesa-de-madera'], { replaceUrl: true });
    expect(itemsService.itemsIdGet).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('itemId', 'mesa-de-madera');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(itemsService.itemsIdGet).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.shareUrl()).toBe(`${environment.siteUrl}/items/mesa-de-madera`);
    expect(fixture.componentInstance.conversionReturnUrl()).toBe('/items/mesa-de-madera');
  });

  it('keeps the loaded item when the canonical redirect fails', async () => {
    const { fixture } = await mount('page', true);
    expect(fixture.componentInstance.item()?.id).toBe(uuid);
    expect(fixture.componentInstance.errorKey()).toBeNull();
  });
});

describe('ItemDetailPanelComponent — item SEO', () => {
  const itemId = 'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee';

  async function mountSeo(presentation: 'page' | 'modal') {
    const itemSeoApply = vi.fn();
    const itemSeoClear = vi.fn();
    TestBed.configureTestingModule({
      imports: [
        ItemDetailPanelComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: minimalI18n },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: ItemsService,
          useValue: {
            itemsIdGet: vi.fn().mockResolvedValue({ ...mockItem, id: itemId }),
          },
        },
        { provide: UsersService, useValue: { usersMeRequestsGet: vi.fn().mockResolvedValue({ requests: [] }) } },
        { provide: SessionService, useValue: makeSessionMock(null) },
        {
          provide: ItemSeoService,
          useValue: { apply: itemSeoApply, clear: itemSeoClear },
        },
      ],
    });
    const fixture = TestBed.createComponent(ItemDetailPanelComponent);
    fixture.componentRef.setInput('presentation', presentation);
    fixture.componentRef.setInput('itemId', itemId);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { itemSeoApply, itemSeoClear };
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not touch ItemSeoService when opened as modal', async () => {
    const { itemSeoApply, itemSeoClear } = await mountSeo('modal');
    expect(itemSeoClear).not.toHaveBeenCalled();
    expect(itemSeoApply).not.toHaveBeenCalled();
  });

  it('applies item SEO when opened as page', async () => {
    const { itemSeoApply, itemSeoClear } = await mountSeo('page');
    expect(itemSeoClear).toHaveBeenCalled();
    expect(itemSeoApply).toHaveBeenCalledTimes(1);
  });
});
