import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { map } from 'rxjs';
import type { CancelDeliveryResponse } from '../../../core/api/generated/models/cancel-delivery-response';
import type { DeliverySession } from '../../../core/api/generated/models/delivery-session';
import { DeliveryService } from '../../../core/api/generated/services/delivery.service';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import {
  normalizeItemCategory,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import {
  DeliverySessionStepTrailComponent,
  type DeliverySessionStepView,
} from '../../../shared/components/delivery-session-step-trail/delivery-session-step-trail.component';
import { DeliverySessionStatusBadgeComponent } from '../../../shared/components/delivery-session-status-badge/delivery-session-status-badge.component';
import { ItemCategoryChipComponent } from '../../../shared/components/item-category-chip/item-category-chip.component';
import { ItemConditionChipComponent } from '../../../shared/components/item-condition-chip/item-condition-chip.component';
import { ItemImageGalleryComponent } from '../../../shared/components/item-image-gallery/item-image-gallery.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';
import {
  mapDeliverySessionCancelError,
  mapDeliverySessionError,
  mapDeliverySessionMutationError,
} from '../delivery-session-error.util';
import { DeliverySessionConfirmDialogComponent } from '../../../shared/components/delivery-session-confirm-dialog/delivery-session-confirm-dialog.component';
import { DeliverySessionCancelDialogComponent } from '../../../shared/components/delivery-session-cancel-dialog/delivery-session-cancel-dialog.component';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function daysUntilDeadline(iso: string): number | null {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return null;
  }
  return Math.ceil((ms - Date.now()) / 86_400_000);
}

function formatDeadlineDate(iso: string, locale: string): string {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return '—';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(ms);
}

@Component({
  selector: 'app-entrega-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslocoModule,
    BtnComponent,
    DeliverySessionStatusBadgeComponent,
    ItemCategoryChipComponent,
    DeliverySessionStepTrailComponent,
    ItemConditionChipComponent,
    ItemImageGalleryComponent,
    UserAvatarComponent,
    DeliverySessionConfirmDialogComponent,
    DeliverySessionCancelDialogComponent,
  ],
  templateUrl: './entrega-detalle.component.html',
  styleUrl: './entrega-detalle.component.scss',
  host: {
    '[class.entrega-detalle--panel]': 'panelMode()',
  },
})
export class EntregaDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly deliveryApi = inject(DeliveryService);
  private readonly document = inject(DOCUMENT);

  /** When true, embedded in `/entregas` split (no full-page chrome). */
  readonly panelMode = input(false);
  readonly sessionId = input<string | null>(null);
  readonly closed = output<void>();
  readonly sessionUpdated = output<void>();

  private readonly routeSessionId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null as string | null },
  );

  readonly effectiveSessionId = computed(() => {
    const fromInput = this.sessionId();
    if (fromInput) {
      return fromInput;
    }
    if (this.panelMode()) {
      return null;
    }
    return this.routeSessionId() ?? '';
  });

  readonly loading = signal(false);
  readonly session = signal<DeliverySession | null>(null);
  readonly errorKey = signal<string | null>(null);
  readonly errorBackRoute = signal<'/entregas' | '/mis-objetos'>('/entregas');
  readonly selectedImageIndex = signal(0);
  readonly confirmOpen = signal(false);
  readonly confirmSubmitting = signal(false);
  readonly confirmErrorKey = signal<string | null>(null);
  readonly cancelOpen = signal(false);
  readonly cancelSubmitting = signal(false);
  readonly cancelErrorKey = signal<string | null>(null);

  private loadSeq = 0;

  readonly isDonor = computed(() => this.session()?.role === 'donor');
  readonly showDonorActions = computed(
    () => this.isDonor() && this.session()?.status === 'active',
  );

  readonly otherScoreDisplay = computed(() => {
    const score = this.session()?.otherParty?.reputationScore;
    if (score === undefined || score === null) {
      return '—';
    }
    return score > 0 ? `+${score}` : `${score}`;
  });

  readonly otherScoreTone = computed(() => {
    const score = this.session()?.otherParty?.reputationScore ?? 0;
    if (score >= 60) return 'good';
    if (score >= 20) return 'fair';
    return 'low';
  });

  readonly otherDistanceKm = computed(() => {
    const meters = this.session()?.otherParty?.distanceMeters;
    return meters != null ? formatDistanceKm(meters) : '—';
  });
  readonly otherLocationName = computed(() => this.session()?.otherParty?.locationName ?? null);

  readonly itemCategory = computed<ItemCategory>(() =>
    normalizeItemCategory(
      (this.session()?.item as { category?: unknown } | undefined)?.category,
    ),
  );

  readonly deadlineDaysLeft = computed(() => {
    const deadline = this.session()?.deadlineAt;
    return deadline ? daysUntilDeadline(deadline) : null;
  });

  readonly deadlineUrgency = computed(() => {
    const days = this.deadlineDaysLeft();
    if (days === null) return 'ok';
    if (days <= 1) return 'urgent';
    if (days <= 3) return 'warn';
    return 'ok';
  });

  readonly sessionSteps = computed((): DeliverySessionStepView[] => {
    const session = this.session();
    if (!session) {
      return [];
    }
    const startedSub = this.formatDeadline(session.createdAt);
    if (session.role === 'donor') {
      return [
        {
          labelKey: 'delivery.detail.step_donor_selected',
          sub: startedSub,
          done: true,
          current: false,
        },
        {
          labelKey: 'delivery.detail.step_donor_active',
          done: session.status !== 'active',
          current: session.status === 'active',
        },
        {
          labelKey: 'delivery.detail.step_donor_completed',
          done: session.status === 'completed',
          current: false,
        },
      ];
    }
    return [
      {
        labelKey: 'delivery.detail.step_receiver_selected',
        sub: startedSub,
        done: true,
        current: false,
      },
      {
        labelKey: 'delivery.detail.step_receiver_contact',
        done: session.status !== 'active' && session.status !== 'expired',
        current: session.status === 'active',
      },
      {
        labelKey: 'delivery.detail.step_receiver_completed',
        done: session.status === 'completed',
        current: false,
      },
    ];
  });

  constructor() {
    effect(() => {
      const id = this.effectiveSessionId();
      if (!id) {
        this.session.set(null);
        this.errorKey.set(null);
        this.loading.set(false);
        return;
      }
      void this.loadSession(id);
    });
  }

  onClosePanel(): void {
    this.closed.emit();
  }

  deadlineLabelKey(): string {
    const days = this.deadlineDaysLeft();
    if (days === null) {
      return 'delivery.detail.deadline_unknown';
    }
    if (days <= 0) {
      return 'delivery.detail.deadline_last_day';
    }
    if (days === 1) {
      return 'delivery.detail.deadline_one_day';
    }
    return 'delivery.detail.deadline_days';
  }

  deadlineLabelParams(): { days: number } | undefined {
    const days = this.deadlineDaysLeft();
    return days !== null && days > 1 ? { days } : undefined;
  }

  formatDeadline(iso: string): string {
    const lang = this.document.documentElement?.lang || 'es';
    return formatDeadlineDate(iso, lang);
  }

  openConfirmDialog(): void {
    if (!this.showDonorActions()) {
      return;
    }
    this.confirmErrorKey.set(null);
    this.confirmOpen.set(true);
  }

  closeConfirmDialog(): void {
    if (this.confirmSubmitting()) {
      return;
    }
    this.confirmOpen.set(false);
    this.confirmErrorKey.set(null);
  }

  async onConfirmDelivery(): Promise<void> {
    const session = this.session();
    if (!session || this.confirmSubmitting()) {
      return;
    }

    this.confirmSubmitting.set(true);
    this.confirmErrorKey.set(null);

    try {
      await this.deliveryApi.deliverySessionsIdConfirmPost({ id: session.id });
      const refreshed = await this.loadSession(session.id, { refresh: true });
      if (refreshed) {
        this.confirmOpen.set(false);
        this.sessionUpdated.emit();
      } else {
        this.confirmErrorKey.set('delivery.detail.errors.action_failed');
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.confirmErrorKey.set(
        mapDeliverySessionMutationError(err).errorKey,
      );
    } finally {
      this.confirmSubmitting.set(false);
    }
  }

  openCancelDialog(): void {
    if (!this.showDonorActions()) {
      return;
    }
    this.cancelErrorKey.set(null);
    this.cancelOpen.set(true);
  }

  closeCancelDialog(): void {
    if (this.cancelSubmitting()) {
      return;
    }
    this.cancelOpen.set(false);
    this.cancelErrorKey.set(null);
  }

  async onCancelSessionConfirm(noShow: boolean): Promise<void> {
    const session = this.session();
    if (!session || this.cancelSubmitting()) {
      return;
    }

    this.cancelSubmitting.set(true);
    this.cancelErrorKey.set(null);

    try {
      const cancelRes = await this.deliveryApi.deliverySessionsIdCancelPost({
        id: session.id,
        body: { noShow },
      });
      const refreshed = await this.loadSession(session.id, { refresh: true });
      if (!refreshed) {
        this.mergeCancelResponseIntoSession(session, cancelRes);
      }
      if (refreshed || this.session()?.status === 'cancelled') {
        this.cancelOpen.set(false);
        this.sessionUpdated.emit();
      } else {
        this.cancelErrorKey.set('delivery.detail.errors.action_failed');
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.cancelErrorKey.set(mapDeliverySessionCancelError(err).errorKey);
    } finally {
      this.cancelSubmitting.set(false);
    }
  }

  private mergeCancelResponseIntoSession(
    session: DeliverySession,
    cancelRes: CancelDeliveryResponse,
  ): void {
    this.session.set({
      ...session,
      status: cancelRes.status,
      noShowDeclared: cancelRes.noShowDeclared,
      completedAt: cancelRes.completedAt,
      contactChannel: null,
      sharedContactChannel: null,
    });
  }

  private async loadSession(
    id: string,
    options?: { refresh?: boolean },
  ): Promise<boolean> {
    const refresh = options?.refresh ?? false;
    const seq = ++this.loadSeq;

    if (!refresh) {
      this.loading.set(true);
      this.errorKey.set(null);
      this.session.set(null);
      this.selectedImageIndex.set(0);
    } else {
      this.errorKey.set(null);
    }

    if (!UUID_V4.test(id)) {
      if (seq === this.loadSeq && !refresh) {
        this.errorKey.set('delivery.detail.errors.not_found');
        this.errorBackRoute.set('/entregas');
        this.loading.set(false);
      }
      return false;
    }

    try {
      const res = await this.deliveryApi.deliverySessionsIdGet({ id });
      if (seq !== this.loadSeq) {
        return false;
      }
      this.session.set(res);
      return true;
    } catch (err) {
      if (seq !== this.loadSeq) {
        return false;
      }
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return false;
      }
      if (refresh) {
        return false;
      }
      const mapped = mapDeliverySessionError(err);
      this.errorKey.set(mapped.errorKey);
      this.errorBackRoute.set(mapped.backRoute);
      return false;
    } finally {
      if (seq === this.loadSeq && !refresh) {
        this.loading.set(false);
      }
    }
  }
}
