import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { DeliverySession } from '../../../core/api/generated/models/delivery-session';
import { DeliveryService } from '../../../core/api/generated/services/delivery.service';
import { EntregaDetalleComponent } from './entrega-detalle.component';

const SESSION_ID = '11111111-2222-4333-8444-555555555555';

const mockSession: DeliverySession = {
  id: SESSION_ID,
  itemId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
  status: 'active',
  contactChannel: 'WhatsApp: +34 600 000 000',
  sharedContactChannel: null,
  receiverContactChannel: null,
  deadlineAt: '2026-05-24T12:00:00.000Z',
  donorConfirmed: false,
  noShowDeclared: false,
  createdAt: '2026-05-17T12:00:00.000Z',
  completedAt: null,
  role: 'receiver',
  item: {
    title: 'Mesa escritorio',
    condition: 'good',
    category: 'other',
    images: ['https://example.com/items/a.jpg'],
  },
  otherParty: {
    userId: '660e8400-e29b-41d4-a716-446655440001',
    firstName: 'María',
    lastName: 'Donante',
    avatarUrl: null,
    reputationScore: 85,
    distanceMeters: 1800,
    locationName: null,
  },
};

const esJson = {
  delivery: {
    detail: {
      back: 'Volver',
      loading: 'Cargando…',
      role_donor: 'Donante',
      role_receiver: 'Receptor',
      status_active: 'Activa',
      channel_receiver_label: 'Canal donante',
      channel_unavailable: 'No disponible',
      receiver_contact_channel_label: 'Cómo contactar al receptor',
      other_donor: 'Donante',
      other_receiver: 'Receptor',
      distance_away: '{{km}} km de distancia',
      deadline_one_day: '1 día',
      deadline_expires: 'vence {{date}}',
      completed_donor: 'Entrega completada',
      completed_donor_lead: 'Entrega completada · ',
      completed_donor_points: '+10 puntos',
      completed_donor_tail: ' de reputación',
      cancelled_no_show_title: 'Ausencia registrada',
      cancelled_no_show_body: 'La reputación del receptor bajará por no haberse presentado.',
      errors: {
        title: 'Error',
        not_found: 'No encontrada',
        forbidden: 'Prohibido',
        load_failed: 'Fallo',
        confirm_conflict: 'Conflicto confirmación',
        cancel_conflict: 'Conflicto cancelación',
        action_failed: 'Acción fallida',
        back: 'Volver',
      },
      actions: { confirm: 'Confirmar', cancel: 'Cancelar' },
      steps_title: 'Estado de la sesión',
      step_donor_selected: 'Receptor seleccionado',
      step_donor_active: 'Sesión activa',
      step_donor_completed: 'Entrega confirmada',
      step_receiver_selected: 'Seleccionado',
      step_receiver_contact: 'Contacto recibido',
      step_receiver_completed: 'Entrega completada',
    },
  },
  profile: {
    public: { title: 'Perfil de usuario' },
  },
  items: {
    category: {
      other: 'Otros',
    },
    explore: { distance_km: '{{km}} km' },
    publish: { condition_good: 'Buen estado' },
    my_objects: {
      confirm_delivery: {
        title: '¿Confirmar?',
        body_lead: 'Al confirmar',
        body_points: '+10',
        body_tail: '.',
        dismiss: 'Cancelar',
        confirm: 'Confirmar entrega',
        confirming: 'Confirmando',
      },
      cancel_session: {
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
};

describe('EntregaDetalleComponent', () => {
  let deliveryGet: ReturnType<typeof vi.fn>;
  let deliveryConfirmPost: ReturnType<typeof vi.fn>;
  let deliveryCancelPost: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    deliveryGet = vi.fn().mockResolvedValue(mockSession);
    deliveryConfirmPost = vi.fn().mockResolvedValue({
      status: 'completed',
      completedAt: '2026-05-23T12:00:00.000Z',
    });
    deliveryCancelPost = vi.fn().mockResolvedValue({
      status: 'cancelled',
      noShowDeclared: false,
      completedAt: '2026-05-23T12:00:00.000Z',
    });

    await TestBed.configureTestingModule({
      imports: [
        EntregaDetalleComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: SESSION_ID })),
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet: deliveryGet,
            deliverySessionsIdConfirmPost: deliveryConfirmPost,
            deliverySessionsIdCancelPost: deliveryCancelPost,
          },
        },
      ],
    }).compileComponents();
  });

  it('loads session with a single deliverySessionsIdGet call', async () => {
    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryGet).toHaveBeenCalledTimes(1);
    expect(deliveryGet).toHaveBeenCalledWith({ id: SESSION_ID });
    expect(fixture.nativeElement.textContent).toContain('Mesa escritorio');
    expect(fixture.nativeElement.textContent).toContain('WhatsApp');
    expect(fixture.nativeElement.textContent).toContain('Otros');
  });

  it('links other party row to public profile (AC 15)', async () => {
    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a.entrega-detalle__party-row--link',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain(
      `/users/${mockSession.otherParty!.userId}`,
    );
  });

  it('shows enabled donor action buttons for active session', async () => {
    deliveryGet.mockResolvedValue({
      ...mockSession,
      role: 'donor',
      contactChannel: null,
      sharedContactChannel: 'Telegram: @donor',
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const actionButtons = fixture.debugElement.queryAll(
      By.css('.entrega-detalle__actions app-btn'),
    );
    expect(actionButtons.length).toBe(2);
    expect(actionButtons[0].componentInstance.disabled()).toBe(false);
    expect(actionButtons[1].componentInstance.disabled()).toBe(false);
  });

  it('opens confirm dialog when donor clicks confirm', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const confirmBtn = fixture.nativeElement.querySelector(
      '.entrega-detalle__actions app-btn',
    ) as HTMLElement;
    confirmBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('app-delivery-session-confirm-dialog'),
    ).toBeTruthy();
  });

  it('confirms delivery and refetches session as completed', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    const completedSession = {
      ...activeDonor,
      status: 'completed' as const,
      donorConfirmed: true,
      completedAt: '2026-05-23T12:00:00.000Z',
      sharedContactChannel: null,
    };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockResolvedValueOnce(completedSession);

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryConfirmPost).toHaveBeenCalledWith({ id: SESSION_ID });
    expect(deliveryGet).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.confirmOpen()).toBe(false);
    expect(fixture.componentInstance.session()?.status).toBe('completed');
    expect(fixture.nativeElement.textContent).toContain('Entrega completada');
    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__actions'),
    ).toBeNull();
  });

  it('keeps dialog open with mapped error on confirm 409', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });
    deliveryConfirmPost.mockRejectedValue(new HttpErrorResponse({ status: 409 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(fixture.componentInstance.confirmErrorKey()).toBe(
      'delivery.detail.errors.confirm_conflict',
    );
    expect(fixture.nativeElement.textContent).toContain('Conflicto confirmación');
  });

  it('keeps dialog open with mapped error on confirm 403', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });
    deliveryConfirmPost.mockRejectedValue(new HttpErrorResponse({ status: 403 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(fixture.componentInstance.confirmErrorKey()).toBe(
      'delivery.detail.errors.forbidden',
    );
    expect(fixture.nativeElement.textContent).toContain('Prohibido');
  });

  it('keeps dialog open with mapped error on confirm 404', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });
    deliveryConfirmPost.mockRejectedValue(new HttpErrorResponse({ status: 404 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(fixture.componentInstance.confirmErrorKey()).toBe(
      'delivery.detail.errors.not_found',
    );
    expect(fixture.nativeElement.textContent).toContain('No encontrada');
  });

  it('keeps dialog open when confirm succeeds but refetch fails', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockRejectedValueOnce(new HttpErrorResponse({ status: 500 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onConfirmDelivery();
    fixture.detectChanges();

    expect(deliveryConfirmPost).toHaveBeenCalledWith({ id: SESSION_ID });
    expect(fixture.componentInstance.confirmOpen()).toBe(true);
    expect(fixture.componentInstance.confirmErrorKey()).toBe(
      'delivery.detail.errors.action_failed',
    );
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Mesa escritorio');
  });

  it('does not show full-page loading during confirm refetch', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    const completedSession = {
      ...activeDonor,
      status: 'completed' as const,
      donorConfirmed: true,
      completedAt: '2026-05-23T12:00:00.000Z',
    };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(completedSession), 50);
          }),
      );

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openConfirmDialog();
    fixture.detectChanges();
    const confirmPromise = fixture.componentInstance.onConfirmDelivery();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Mesa escritorio');

    await confirmPromise;
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.session()?.status).toBe('completed');
  });

  it('opens cancel dialog when donor clicks cancel', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const actionButtons = fixture.debugElement.queryAll(
      By.css('.entrega-detalle__actions app-btn'),
    );
    actionButtons[1].nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.cancelOpen()).toBe(true);
    expect(
      fixture.nativeElement.querySelector('app-delivery-session-cancel-dialog'),
    ).toBeTruthy();
  });

  it('cancels session without no-show and refetches as cancelled', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    const cancelledSession = {
      ...activeDonor,
      status: 'cancelled' as const,
      noShowDeclared: false,
      completedAt: '2026-05-23T12:00:00.000Z',
      sharedContactChannel: null,
    };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockResolvedValueOnce(cancelledSession);

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openCancelDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(false);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryCancelPost).toHaveBeenCalledWith({
      id: SESSION_ID,
      body: { noShow: false },
    });
    expect(deliveryGet).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.cancelOpen()).toBe(false);
    expect(fixture.componentInstance.session()?.status).toBe('cancelled');
    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__actions'),
    ).toBeNull();
  });

  it('cancels session with no-show and sets noShowDeclared', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    const cancelledSession = {
      ...activeDonor,
      status: 'cancelled' as const,
      noShowDeclared: true,
      completedAt: '2026-05-23T12:00:00.000Z',
    };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockResolvedValueOnce(cancelledSession);

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openCancelDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryCancelPost).toHaveBeenCalledWith({
      id: SESSION_ID,
      body: { noShow: true },
    });
    expect(fixture.componentInstance.session()?.noShowDeclared).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Ausencia registrada');
    expect(fixture.nativeElement.textContent).toContain('La reputación del receptor bajará');
    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__cancelled-banner--no-show'),
    ).toBeTruthy();
  });

  it('merges cancel response when refetch fails after successful POST', async () => {
    const activeDonor = { ...mockSession, role: 'donor' as const };
    deliveryGet
      .mockResolvedValueOnce(activeDonor)
      .mockRejectedValueOnce(new HttpErrorResponse({ status: 500 }));
    deliveryCancelPost.mockResolvedValue({
      status: 'cancelled',
      noShowDeclared: false,
      completedAt: '2026-05-23T12:00:00.000Z',
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    const sessionUpdated = vi.fn();
    fixture.componentInstance.sessionUpdated.subscribe(sessionUpdated);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openCancelDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(false);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryCancelPost).toHaveBeenCalled();
    expect(fixture.componentInstance.cancelOpen()).toBe(false);
    expect(fixture.componentInstance.session()?.status).toBe('cancelled');
    expect(sessionUpdated).toHaveBeenCalled();
  });

  it('keeps cancel dialog open with mapped error on cancel 409', async () => {
    deliveryGet.mockResolvedValue({ ...mockSession, role: 'donor' });
    deliveryCancelPost.mockRejectedValue(new HttpErrorResponse({ status: 409 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.componentInstance.openCancelDialog();
    fixture.detectChanges();
    await fixture.componentInstance.onCancelSessionConfirm(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.cancelOpen()).toBe(true);
    expect(fixture.componentInstance.cancelErrorKey()).toBe(
      'delivery.detail.errors.cancel_conflict',
    );
    expect(fixture.nativeElement.textContent).toContain('Conflicto cancelación');
  });

  it('does not show donor actions for receiver', async () => {
    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__actions'),
    ).toBeNull();
  });

  it('shows friendly error on 404', async () => {
    deliveryGet.mockRejectedValue(new HttpErrorResponse({ status: 404 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.errorKey()).toBe(
      'delivery.detail.errors.not_found',
    );
  });

  it('shows friendly error on 403 with back to mis-objetos', async () => {
    deliveryGet.mockRejectedValue(new HttpErrorResponse({ status: 403 }));

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.errorKey()).toBe(
      'delivery.detail.errors.forbidden',
    );
    expect(fixture.componentInstance.errorBackRoute()).toBe('/mis-objetos');
  });

  it('shows not_found for invalid session id without calling API', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        EntregaDetalleComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'not-a-valid-uuid' })),
          },
        },
        {
          provide: DeliveryService,
          useValue: {
            deliverySessionsIdGet: deliveryGet,
            deliverySessionsIdConfirmPost: deliveryConfirmPost,
            deliverySessionsIdCancelPost: deliveryCancelPost,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(deliveryGet).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errorKey()).toBe(
      'delivery.detail.errors.not_found',
    );
  });

  it('hides receiver channel block when active session has no contactChannel', async () => {
    deliveryGet.mockResolvedValue({
      ...mockSession,
      contactChannel: null,
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__channel--receiver'),
    ).toBeNull();
  });

  it('shows receiver contact channel block for donor when value is set (AC 7)', async () => {
    deliveryGet.mockResolvedValue({
      ...mockSession,
      role: 'donor',
      contactChannel: null,
      sharedContactChannel: 'Telegram: @donor',
      receiverContactChannel: 'Telegram: @almudena_lr',
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const block = fixture.nativeElement.querySelector(
      '.entrega-detalle__channel--receiver-contact',
    ) as HTMLElement;
    expect(block).toBeTruthy();
    expect(block.querySelector('.entrega-detalle__channel-icon')).toBeTruthy();
    expect(block.textContent).toContain('Cómo contactar al receptor');
    expect(block.textContent).toContain('Telegram: @almudena_lr');
  });

  it('hides receiver contact channel block when value is null (AC 8)', async () => {
    deliveryGet.mockResolvedValue({
      ...mockSession,
      role: 'donor',
      contactChannel: null,
      sharedContactChannel: 'Telegram: @donor',
      receiverContactChannel: null,
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__channel--receiver-contact'),
    ).toBeNull();
  });

  it('hides receiver contact channel block for receiver role even when API sends value (AC 9)', async () => {
    deliveryGet.mockResolvedValue({
      ...mockSession,
      role: 'receiver',
      receiverContactChannel: 'Telegram: @almudena_lr',
    });

    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.entrega-detalle__channel--receiver-contact'),
    ).toBeNull();
  });

  it('renders session step trail for receiver', async () => {
    const fixture = TestBed.createComponent(EntregaDetalleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-delivery-session-step-trail'),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Estado de la sesión');
  });
});
