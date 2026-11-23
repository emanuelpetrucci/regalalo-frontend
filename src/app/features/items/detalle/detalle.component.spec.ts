import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from '@angular/router';
import { defer, of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { GetItemResponse } from '../../../core/api/generated/models/get-item-response';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import { ItemDetailPanelComponent } from '../../../shared/components/item-detail-panel/item-detail-panel.component';
import { DetalleComponent } from './detalle.component';

const ITEM_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const ITEM_SLUG = 'mesa-de-madera';
const DONOR_ID = '11111111-2222-4333-8444-555555555555';
const VIEWER_ID = '550e8400-e29b-41d4-a716-446655440000';

const detailI18n = {
  back: 'Volver al listado',
  photo_of: 'Foto {{current}} de {{total}}',
  gallery_prev: 'Anterior',
  gallery_next: 'Siguiente',
  gallery_thumbs: 'Miniaturas',
  gallery_thumb: 'Foto {{n}}',
  donor_label: 'Donante',
  reputation_good: 'Buen historial',
  reputation_fair: 'Historial regular',
  reputation_low: 'Historial bajo',
  degraded_notice: 'Degradado',
  cta_interested: 'Me interesa',
  request_item: 'Me interesa',
  cta_paused_title: 'Solicitudes pausadas',
  cta_paused_body: 'Pausadas',
  cta_unavailable: 'No disponible',
  donor_manage_hint: 'Gestiona desde Mis objetos',
  status_active: 'Disponible',
  status_reserved: 'Reservado',
  status_completed: 'Completado',
  status_cancelled: 'Cancelado',
  not_found_title: 'Objeto no encontrado',
  not_found_body: 'No disponible',
  loading: 'Cargando…',
  errors: { load_failed: 'Error carga', retry: 'Reintentar' },
};

const esJson = {
  items: {
    detail: detailI18n,
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
    explore: { distance_km: '{{km}} km', image_alt: 'Foto de {{title}}' },
    publish: {
      condition_good: 'Buen estado',
      condition_fair: 'Aceptable',
      condition_new: 'Nuevo',
      condition_like_new: 'Como nuevo',
    },
    cancel: {
      trigger: 'Cancelar objeto',
      dialog_title: 'Cancelar objeto',
      dialog_body: 'Dejará de aparecer',
      dialog_title_with_session: 'Cancelar objeto y entrega',
      dialog_body_with_session: 'Se cancelará la entrega en curso.',
      confirm: 'Confirmar cancelación',
      confirming: 'Cancelando…',
      dismiss: 'Volver',
      errors: {
        forbidden: 'No puedes cancelar',
        not_found: 'No disponible',
        generic: 'Error genérico',
        connection: 'Sin conexión',
      },
    },
    pause: {
      title: 'Pausar solicitudes',
      subtitle_active: 'Aceptando nuevas solicitudes',
      subtitle_paused: 'No se admiten nuevas solicitudes',
      banner_paused: 'Las solicitudes están pausadas.',
      not_available: 'La gestión de pausa no está disponible en este estado.',
      errors: {
        forbidden: 'No puedes cambiar la pausa',
        not_found: 'El objeto ya no está disponible',
        not_active: 'Solo puedes pausar objetos activos',
        generic: 'No se pudo actualizar la pausa.',
        connection: 'Error de conexión.',
      },
    },
    request: {
      contact_sheet: {
        title: '¿Cómo puede contactarte el donante?',
        subtitle: 'Si te seleccionan…',
        cta_submit: 'Enviar solicitud',
        cta_cancel: 'Cancelar',
      },
      contact_channel: {
        label: 'Tu canal de contacto',
        placeholder: 'Ej: WhatsApp…',
        hint: 'Puedes escribir lo que prefieras.',
        error: {
          required: 'Introduce tu canal de contacto para continuar',
        },
      },
      dialog_title: '¿Confirmar interés?',
      dialog_body: 'Si el donante te elige…',
      confirm: 'Confirmar interés',
      confirming: 'Enviando…',
      dismiss: 'Cancelar',
      pending_title: 'Solicitud enviada',
      pending_body: 'Estás en la lista de candidatos.',
      pending_step_sent: 'Solicitud enviada',
      pending_step_waiting: 'Esperando decisión',
      pending_step_contact: 'Contacto recibido',
      limit_title: 'Has agotado tus turnos',
      errors: {
        own_item: 'No puedes solicitar tu propio objeto',
        duplicate: 'Ya tienes una solicitud activa',
        limit_reached: 'Límite de 3 solicitudes activas',
        paused: 'Solicitudes pausadas por el donante',
        generic: 'Error al solicitar',
        connection: 'Sin conexión',
      },
    },
  },
  nav: { my_items: 'Mis objetos' },
};

function getPanel(
  fixture: ReturnType<typeof TestBed.createComponent<DetalleComponent>>,
): ItemDetailPanelComponent {
  const debug = fixture.debugElement.query(By.directive(ItemDetailPanelComponent));
  return debug.componentInstance as ItemDetailPanelComponent;
}

function openCancelDialog(
  fixture: ReturnType<typeof TestBed.createComponent<DetalleComponent>>,
  currentTarget?: HTMLElement,
): void {
  const target = currentTarget ?? document.createElement('button');
  getPanel(fixture).openCancelDialog({
    currentTarget: target,
  } as unknown as Event);
}

function openRequestDialog(
  fixture: ReturnType<typeof TestBed.createComponent<DetalleComponent>>,
): void {
  getPanel(fixture).onInterestedClick();
}

function baseItem(overrides: Partial<GetItemResponse> = {}): GetItemResponse {
  return {
    id: ITEM_ID,
    slug: ITEM_SLUG,
    title: 'Mesa de madera',
    description: 'En buen estado',
    condition: 'good',
    category: 'furniture',
    weightRange: '1to5',
    status: 'active',
    requestsPaused: false,
    degradedAt: null,
    distanceMeters: 3500,
    images: ['https://example.com/photo.jpg'],
    locationName: null,
    donor: {
      id: DONOR_ID,
      firstName: 'María',
      lastName: 'López',
      avatarUrl: null,
      reputationScore: 20,
    },
    createdAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('DetalleComponent', () => {
  let routeSlug = ITEM_ID;
  let itemsIdGet: ReturnType<typeof vi.fn>;
  let itemsIdDelete: ReturnType<typeof vi.fn>;
  let itemsIdRequestsPost: ReturnType<typeof vi.fn>;
  let usersMeRequestsGet: ReturnType<typeof vi.fn>;
  let sessionUser: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    routeSlug = ITEM_ID;
    itemsIdGet = vi.fn();
    itemsIdDelete = vi.fn();
    itemsIdRequestsPost = vi.fn();
    usersMeRequestsGet = vi.fn().mockResolvedValue({ requests: [] });
    sessionUser = vi.fn().mockReturnValue({ id: VIEWER_ID, email: 'u@test.com', reputationScore: 10 });

    await TestBed.configureTestingModule({
      imports: [
        DetalleComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([
          { path: 'items/:slug', component: DetalleComponent },
          { path: 'mis-objetos', component: DetalleComponent },
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: defer(() => of(convertToParamMap({ slug: routeSlug }))),
            snapshot: {
              get paramMap() {
                return convertToParamMap({ slug: routeSlug });
              },
            },
          },
        },
        {
          provide: ItemsService,
          useValue: { itemsIdGet, itemsIdDelete, itemsIdRequestsPost },
        },
        {
          provide: UsersService,
          useValue: { usersMeRequestsGet },
        },
        {
          provide: SessionService,
          useValue: {
            user: sessionUser,
            isLoggedIn: () => (sessionUser as unknown as () => unknown)() != null,
          },
        },
      ],
    }).compileComponents();
  });

  async function createAndWait(): Promise<
    ReturnType<typeof TestBed.createComponent<DetalleComponent>>
  > {
    const fixture = TestBed.createComponent(DetalleComponent);
    fixture.detectChanges();
    for (let i = 0; i < 50 && getPanel(fixture).loading(); i++) {
      await new Promise((r) => setTimeout(r, 0));
      fixture.detectChanges();
    }
    return fixture;
  }

  it('loads item and shows title (AC 1)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    expect(itemsIdGet).toHaveBeenCalledWith({ id: ITEM_ID });
    expect(fixture.nativeElement.textContent).toContain('Mesa de madera');
  });

  it('redirects legacy UUID route to canonical slug', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    await createAndWait();
    expect(navigateSpy).toHaveBeenCalledWith(['/items', ITEM_SLUG], { replaceUrl: true });
  });

  it('does not redirect when the route segment is already a slug', async () => {
    routeSlug = ITEM_SLUG;
    itemsIdGet.mockResolvedValue(baseItem());
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    await createAndWait();
    expect(itemsIdGet).toHaveBeenCalledWith({ id: ITEM_SLUG });
    expect(navigateSpy).not.toHaveBeenCalledWith(['/items', ITEM_SLUG], { replaceUrl: true });
  });

  it('shows category chip with translated label (AC 7-f4)', async () => {
    itemsIdGet.mockResolvedValue(baseItem({ category: 'furniture' }));
    const fixture = await createAndWait();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Muebles');
    expect(fixture.nativeElement.querySelector('app-item-category-chip')).toBeTruthy();
  });

  it('does not render weight range labels in detail panel (AC 7-f4 DLT-004)', async () => {
    itemsIdGet.mockResolvedValue(
      baseItem({
        category: 'furniture',
        weightRange: '1to5',
      }),
    );
    const fixture = await createAndWait();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).not.toContain('Entre 1 y 5');
    expect(text).not.toContain('Menos de 1 kg');
    expect(text).not.toContain('items.weight_range');
  });

  it('shows 404 view when item not found (AC 5)', async () => {
    itemsIdGet.mockRejectedValue(new HttpErrorResponse({ status: 404 }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.textContent).toContain('Objeto no encontrado');
  });

  it('shows pause control and cancel for donor active item (AC 1–3)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    expect(fixture.nativeElement.querySelector('app-item-detail-donor-controls')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-toggle-switch')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-label="Cancelar objeto"]')).toBeTruthy();
    expect(fixture.nativeElement.textContent).not.toContain('Me interesa');
  });

  it('updates requestsPaused on pausedChange (AC 2)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    getPanel(fixture).onPausedChange(true);
    fixture.detectChanges();
    expect(getPanel(fixture).item()?.requestsPaused).toBe(true);
  });

  it('hides pause control for donor reserved (AC 1)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem({ status: 'reserved' }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.querySelector('app-toggle-switch')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Cancelar objeto"]')).toBeTruthy();
  });

  it('shows not_available for donor completed (AC 1)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem({ status: 'completed' }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.querySelector('app-toggle-switch')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(
      'La gestión de pausa no está disponible en este estado.',
    );
  });

  it('shows not_available for donor cancelled (AC 1)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem({ status: 'cancelled' }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.textContent).toContain(
      'La gestión de pausa no está disponible en este estado.',
    );
  });

  it('shows cancel button with session warning for donor reserved (AC 2)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem({ status: 'reserved' }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.querySelector('[aria-label="Cancelar objeto"]')).toBeTruthy();

    openCancelDialog(fixture);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Cancelar objeto y entrega',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Se cancelará la entrega en curso.',
    );
  });

  it('calls itemsIdDelete and navigates on confirm (AC 1)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdDelete.mockResolvedValue({ message: 'ok' });
    const fixture = await createAndWait();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    openCancelDialog(fixture);
    fixture.detectChanges();

    await getPanel(fixture).onCancelConfirm();
    fixture.detectChanges();

    expect(itemsIdDelete).toHaveBeenCalledWith({ id: ITEM_ID });
    expect(navigateSpy).toHaveBeenCalledWith(['/mis-objetos'], {
      queryParams: { cancelled: '1' },
    });
  });

  it('calls itemsIdDelete and navigates on confirm for reserved donor (AC 1)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem({ status: 'reserved' }));
    itemsIdDelete.mockResolvedValue({ message: 'ok' });
    const fixture = await createAndWait();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    openCancelDialog(fixture);
    fixture.detectChanges();

    await getPanel(fixture).onCancelConfirm();
    fixture.detectChanges();

    expect(itemsIdDelete).toHaveBeenCalledWith({ id: ITEM_ID });
    expect(navigateSpy).toHaveBeenCalledWith(['/mis-objetos'], {
      queryParams: { cancelled: '1' },
    });
  });

  it('shows forbidden error in dialog on 403 (AC 3)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdDelete.mockRejectedValue(new HttpErrorResponse({ status: 403 }));
    const fixture = await createAndWait();

    openCancelDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onCancelConfirm();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No puedes cancelar');
  });

  it('shows not_found error in dialog on DELETE 404 (AC 4)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdDelete.mockRejectedValue(new HttpErrorResponse({ status: 404 }));
    const fixture = await createAndWait();

    openCancelDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onCancelConfirm();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No disponible');
  });

  it('restores focus to cancel trigger after dismiss (AC 5)', async () => {
    sessionUser.mockReturnValue({ id: DONOR_ID, email: 'd@test.com', reputationScore: 50 });
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();

    const trigger = fixture.nativeElement.querySelector(
      'app-btn button',
    ) as HTMLButtonElement;
    trigger.focus();
    openCancelDialog(fixture, trigger);
    fixture.detectChanges();

    getPanel(fixture).closeCancelDialog();
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
  });

  it('shows request CTA for non-donor active item (AC 3)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    expect(fixture.nativeElement.textContent).toContain('Me interesa');
  });

  it('shows paused CTA when requestsPaused (AC 4)', async () => {
    itemsIdGet.mockResolvedValue(baseItem({ requestsPaused: true }));
    const fixture = await createAndWait();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Solicitudes pausadas');
    expect(
      fixture.nativeElement.querySelector('.item-cta-block__btn--disabled'),
    ).toBeTruthy();
  });

  it('shows unavailable CTA when status is not active (AC 4)', async () => {
    itemsIdGet.mockResolvedValue(baseItem({ status: 'reserved' }));
    const fixture = await createAndWait();
    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('No disponible');
    expect(text).not.toContain('Solicitudes pausadas');
    expect(
      fixture.nativeElement.querySelector('.item-cta-block__btn--disabled'),
    ).toBeTruthy();
  });

  it('shows 404 view for invalid UUID (400) (AC 5)', async () => {
    itemsIdGet.mockRejectedValue(new HttpErrorResponse({ status: 400 }));
    const fixture = await createAndWait();
    expect(fixture.nativeElement.textContent).toContain('Objeto no encontrado');
  });

  it('shows negative donor reputation via subcomponent (AC 6)', async () => {
    itemsIdGet.mockResolvedValue(
      baseItem({
        donor: {
          id: DONOR_ID,
          firstName: 'María',
          lastName: 'López',
          avatarUrl: null,
          reputationScore: -10,
        },
      }),
    );
    const fixture = await createAndWait();
    expect(fixture.nativeElement.textContent).toContain('-10');
  });

  it('opens contact sheet on Me interesa click (AC 1, 7)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-request-contact-bottom-sheet')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('¿Cómo puede contactarte el donante?');
  });

  it('shows pending state on load when user already requested this item', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    usersMeRequestsGet.mockImplementation(({ status }: { status?: string }) =>
      Promise.resolve({
        requests:
          status === 'pending'
            ? [
                {
                  id: 'req-existing',
                  itemId: ITEM_ID,
                  itemTitle: 'Mesa de madera',
                  itemStatus: 'active',
                  status: 'pending',
                  images: [],
                  createdAt: '2026-05-22T10:00:00.000Z',
                },
              ]
            : [],
      }),
    );
    const fixture = await createAndWait();

    expect(getPanel(fixture).requestDone()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Solicitud enviada');
    expect(fixture.nativeElement.textContent).not.toContain('Me interesa');
    expect(itemsIdRequestsPost).not.toHaveBeenCalled();
  });

  it('shows pending state after successful request (AC 1)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockResolvedValue({
      requestId: 'req-1',
      status: 'pending',
      createdAt: '2026-05-22T10:00:00.000Z',
    });
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('WhatsApp +34 600 000 000');
    fixture.detectChanges();

    expect(itemsIdRequestsPost).toHaveBeenCalledWith({
      id: ITEM_ID,
      body: { contactChannel: 'WhatsApp +34 600 000 000' },
    });
    expect(getPanel(fixture).requestDone()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Solicitud enviada');
    expect(fixture.nativeElement.textContent).not.toContain('Me interesa');
  });

  it('shows limit error and disabled button on 409 limit (AC 4)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Request limit reached' },
      }),
    );
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('test-channel');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Límite de 3 solicitudes activas');
    expect(text).toContain('Has agotado tus turnos');
    expect(
      fixture.nativeElement.querySelector('.item-cta-block__btn--disabled'),
    ).toBeTruthy();
    expect(getPanel(fixture).requestDone()).toBe(false);
  });

  it('shows pending state and duplicate message on 409 duplicate (AC 3)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Already requested this item' },
      }),
    );
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('test-channel');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent ?? '';
    expect(text).toContain('Solicitud enviada');
    expect(text).toContain('Ya tienes una solicitud activa');
    expect(getPanel(fixture).requestDone()).toBe(true);
  });

  it('shows paused error on 409 paused race (AC 5)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockRejectedValue(
      new HttpErrorResponse({
        status: 409,
        error: { message: 'Requests are paused for this item' },
      }),
    );
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('test-channel');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Solicitudes pausadas por el donante',
    );
  });

  it('sets inline field error on 400 and keeps sheet open (AC 2)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockRejectedValue(new HttpErrorResponse({ status: 400 }));
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('test-channel');
    fixture.detectChanges();

    expect(getPanel(fixture).contactSheetFieldErrorKey()).toBe(
      'items.request.contact_channel.error.required',
    );
    expect(getPanel(fixture).contactSheetOpen()).toBe(true);
    expect(getPanel(fixture).requestDone()).toBe(false);
  });

  it('ignores 401 on request without setting error (AC 6)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    itemsIdRequestsPost.mockRejectedValue(new HttpErrorResponse({ status: 401 }));
    const fixture = await createAndWait();
    openRequestDialog(fixture);
    fixture.detectChanges();
    await getPanel(fixture).onContactSheetSubmit('test-channel');
    fixture.detectChanges();

    expect(getPanel(fixture).requestErrorKey()).toBeNull();
    expect(getPanel(fixture).requestDone()).toBe(false);
  });

  it('restores focus to request trigger after dismiss (AC 7)', async () => {
    itemsIdGet.mockResolvedValue(baseItem());
    const fixture = await createAndWait();
    const trigger = fixture.nativeElement.querySelector(
      '.item-cta-block__btn--primary',
    ) as HTMLButtonElement;
    trigger.focus();
    openRequestDialog(fixture);
    fixture.detectChanges();

    getPanel(fixture).closeContactSheet();
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
  });
});
