import { DatePipe, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { DeliverySession } from '../../../core/api/generated/models/delivery-session';
import type { GetItemResponse } from '../../../core/api/generated/models/get-item-response';
import type { MyDeliverySession } from '../../../core/api/generated/models/my-delivery-session';
import type { MyItem } from '../../../core/api/generated/models/my-item';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { DeliveryService } from '../../../core/api/generated/services/delivery.service';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import {
  mapDeliverySessionCancelError,
  mapDeliverySessionMutationError,
} from '../../delivery/delivery-session-error.util';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import { itemPublicUrl } from '../../../core/utils/item-public-path.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { CandidateRowComponent } from '../../../shared/components/candidate-row/candidate-row.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { ItemCancelDialogComponent } from '../../../shared/components/item-cancel-dialog/item-cancel-dialog.component';
import { DeliverySessionCancelDialogComponent } from '../../../shared/components/delivery-session-cancel-dialog/delivery-session-cancel-dialog.component';
import { DeliverySessionConfirmDialogComponent } from '../../../shared/components/delivery-session-confirm-dialog/delivery-session-confirm-dialog.component';
import { ItemSelectReceiverDialogComponent } from '../../../shared/components/item-select-receiver-dialog/item-select-receiver-dialog.component';
import { ItemImageGalleryComponent } from '../../../shared/components/item-image-gallery/item-image-gallery.component';
import { ItemCategoryChipComponent } from '../../../shared/components/item-category-chip/item-category-chip.component';
import { ItemConditionChipComponent } from '../../../shared/components/item-condition-chip/item-condition-chip.component';
import { ItemPauseControlComponent } from '../../../shared/components/item-pause-control/item-pause-control.component';
import { ItemStatusBadgeComponent } from '../../../shared/components/item-status-badge/item-status-badge.component';
import { ShareDialogComponent } from '../../../shared/components/share-dialog/share-dialog.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';
import { mapCancelItemError } from '../cancel-item-error.util';
import { mapSelectReceiverError } from '../select-receiver-error.util';
import { environment } from '../../../../environments/environment';

export interface SelectSuccessState {
  sessionId: string;
  deadlineAt: string;
}

export type MyItemsTab =
  | 'all'
  | 'active'
  | 'reserved'
  | 'completed'
  | 'cancelled';

const TAB_IDS: MyItemsTab[] = [
  'all',
  'active',
  'reserved',
  'completed',
  'cancelled',
];

@Component({
  selector: 'app-mis-objetos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    NgOptimizedImage,
    TranslocoModule,
    RouterLink,
    AlertBoxComponent,
    BtnComponent,
    ItemCancelDialogComponent,
    DeliverySessionCancelDialogComponent,
    DeliverySessionConfirmDialogComponent,
    ItemSelectReceiverDialogComponent,
    ItemImageGalleryComponent,
    ItemPauseControlComponent,
    ItemStatusBadgeComponent,
    ItemCategoryChipComponent,
    ItemConditionChipComponent,
    CandidateRowComponent,
    ShareDialogComponent,
    UserAvatarComponent,
  ],
  templateUrl: './mis-objetos.component.html',
  styleUrl: './mis-objetos.component.scss',
})
export class MisObjetosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApi = inject(UsersService);
  private readonly itemsApi = inject(ItemsService);
  private readonly deliveryApi = inject(DeliveryService);
  private readonly transloco = inject(TranslocoService);

  private detailLoadSeq = 0;

  readonly tabIds = TAB_IDS;

  readonly showCancelledSuccess = signal(false);
  readonly items = signal<MyItem[]>([]);
  readonly loading = signal(true);
  readonly errorKey = signal<string | null>(null);

  readonly activeTab = signal<MyItemsTab>('all');
  readonly selectedId = signal<string | null>(null);

  readonly detail = signal<GetItemResponse | null>(null);
  readonly detailLoading = signal(false);
  readonly detailErrorKey = signal<string | null>(null);
  readonly selectedImageIndex = signal(0);

  readonly candidates = signal<RankedCandidate[]>([]);
  readonly candidatesLoading = signal(false);
  readonly candidatesErrorKey = signal<string | null>(null);

  readonly deliverySession = signal<DeliverySession | null>(null);
  readonly sessionsByItemId = signal<Record<string, MyDeliverySession>>({});

  readonly cancelDialogOpen = signal(false);
  readonly cancelling = signal(false);
  readonly cancelErrorKey = signal<string | null>(null);

  readonly selectModalCandidate = signal<RankedCandidate | null>(null);
  readonly selectSubmitting = signal(false);
  readonly selectErrorKey = signal<string | null>(null);
  readonly selectSuccess = signal<SelectSuccessState | null>(null);

  readonly confirmDeliveryOpen = signal(false);
  readonly confirmDeliverySubmitting = signal(false);
  readonly confirmDeliveryErrorKey = signal<string | null>(null);

  readonly cancelSessionOpen = signal(false);
  readonly cancelSessionSubmitting = signal(false);
  readonly cancelSessionErrorKey = signal<string | null>(null);
  readonly shareDialogOpen = signal(false);

  readonly canManageDeliverySession = computed(() => {
    const session = this.deliverySession();
    return session?.status === 'active' && session.role === 'donor';
  });

  readonly canCancelItemWithSession = computed(() => {
    const d = this.detail();
    return !!(
      d?.status === 'reserved' &&
      this.deliverySession() &&
      this.canManageDeliverySession()
    );
  });

  readonly cancelDialogHasActiveSession = computed(
    () => this.detail()?.status === 'reserved',
  );

  readonly filteredItems = computed(() => {
    const tab = this.activeTab();
    const all = this.items();
    if (tab === 'all') {
      return all;
    }
    return all.filter((i) => i.status === tab);
  });

  readonly tabCounts = computed(() => {
    const all = this.items();
    return {
      all: all.length,
      active: all.filter((i) => i.status === 'active').length,
      reserved: all.filter((i) => i.status === 'reserved').length,
      completed: all.filter((i) => i.status === 'completed').length,
      cancelled: all.filter((i) => i.status === 'cancelled').length,
    } satisfies Record<MyItemsTab, number>;
  });

  readonly hasDetail = computed(() => this.selectedId() !== null);

  readonly reservedOtherScoreDisplay = computed(() => {
    const score = this.deliverySession()?.otherParty?.reputationScore;
    if (score === undefined) {
      return '';
    }
    return score > 0 ? `+${score}` : `${score}`;
  });

  readonly reservedOtherScoreTone = computed(() => {
    const score = this.deliverySession()?.otherParty?.reputationScore ?? 0;
    if (score >= 60) return 'good';
    if (score >= 20) return 'fair';
    return 'low';
  });

  readonly reservedOtherDistanceKm = computed(() => {
    const meters = this.deliverySession()?.otherParty?.distanceMeters;
    return meters != null ? formatDistanceKm(meters) : '—';
  });
  readonly reservedOtherLocationName = computed(() => this.deliverySession()?.otherParty?.locationName ?? null);

  readonly selectedListItem = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return null;
    }
    return this.items().find((i) => i.id === id) ?? null;
  });

  readonly shareDialogTitle = computed(() => this.detail()?.title ?? null);
  readonly shareDialogUrl = computed(() => {
    const item = this.detail();
    if (!item) {
      return '';
    }
    return itemPublicUrl(environment.siteUrl, item);
  });

  ngOnInit(): void {
    const cancelled = this.route.snapshot.queryParamMap.get('cancelled');
    this.showCancelledSuccess.set(cancelled === '1');
    if (cancelled === '1') {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { cancelled: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    void this.loadPage();
  }

  onCandidateSelect(candidate: RankedCandidate): void {
    this.clearSelectSuccess();
    this.selectErrorKey.set(null);
    this.selectModalCandidate.set(candidate);
  }

  closeSelectModal(): void {
    if (this.selectSubmitting()) {
      return;
    }
    this.selectModalCandidate.set(null);
    this.selectErrorKey.set(null);
  }

  selectSuccessDeadlineLabel(deadlineAt: string): string {
    return new Date(deadlineAt).toLocaleDateString(
      this.transloco.getActiveLang(),
      { day: 'numeric', month: 'short', year: 'numeric' },
    );
  }

  async onSelectConfirm(contactChannel: string): Promise<void> {
    const id = this.selectedId();
    const candidate = this.selectModalCandidate();
    if (!id || !candidate || this.selectSubmitting()) {
      return;
    }

    this.selectSubmitting.set(true);
    this.selectErrorKey.set(null);

    try {
      const res = await this.itemsApi.itemsIdRequestsRequestIdSelectPost({
        id,
        requestId: candidate.requestId,
        body: { contactChannel },
      });
      this.selectModalCandidate.set(null);
      this.selectErrorKey.set(null);
      this.selectSuccess.set({
        sessionId: res.sessionId,
        deadlineAt: res.deadlineAt,
      });
      await this.loadPage();
      if (this.errorKey()) {
        this.errorKey.set('items.my_objects.errors.select_refresh_failed');
        return;
      }
      this.activeTab.set('reserved');
      if (this.selectedId() === id) {
        await this.loadDetail(id);
        if (this.detailErrorKey()) {
          this.errorKey.set('items.my_objects.errors.select_refresh_failed');
        }
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      const mapped = mapSelectReceiverError(err);
      this.selectErrorKey.set(
        mapped.bannerKey ?? 'items.my_objects.select_errors.generic',
      );
    } finally {
      this.selectSubmitting.set(false);
    }
  }

  tabLabelKey(tab: MyItemsTab): string {
    return `items.my_objects.tabs.${tab}`;
  }

  daysAgoLabel(createdAt: string): string {
    const days = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / 86_400_000,
    );
    if (days <= 0) {
      return this.transloco.translate('items.my_objects.days_today');
    }
    if (days === 1) {
      return this.transloco.translate('items.my_objects.days_yesterday');
    }
    return this.transloco.translate('items.my_objects.days_ago', { days });
  }

  sessionExpiresLabel(itemId: string): string | null {
    const session = this.sessionsByItemId()[itemId];
    if (!session?.deadlineAt) {
      return null;
    }
    const date = new Date(session.deadlineAt);
    return date.toLocaleDateString(this.transloco.getActiveLang(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  showPausedSuffix(item: MyItem): boolean {
    return item.requestsPaused && item.status === 'active';
  }

  changeTab(tab: MyItemsTab): void {
    this.activeTab.set(tab);
    this.closeDetail();
  }

  selectItem(item: MyItem): void {
    this.clearSelectSuccess();
    this.selectModalCandidate.set(null);
    this.ensureItemVisibleInList(item);
    this.selectedId.set(item.id);
    void this.syncItemIdQueryParam(item.id);
    void this.loadDetail(item.id);
  }

  closeDetail(): void {
    if (this.selectSubmitting()) {
      return;
    }
    this.clearSelectSuccess();
    this.selectedId.set(null);
    this.detail.set(null);
    this.detailErrorKey.set(null);
    this.candidates.set([]);
    this.candidatesErrorKey.set(null);
    this.deliverySession.set(null);
    this.selectedImageIndex.set(0);
    this.selectModalCandidate.set(null);
    this.shareDialogOpen.set(false);
    void this.syncItemIdQueryParam(null);
  }

  openShareDialog(): void {
    if (!this.detail()) {
      return;
    }
    this.shareDialogOpen.set(true);
  }

  closeShareDialog(): void {
    this.shareDialogOpen.set(false);
  }

  async retryDetail(): Promise<void> {
    const id = this.selectedId();
    if (id) {
      await this.loadDetail(id);
    }
  }

  async retryCandidates(): Promise<void> {
    const id = this.selectedId();
    const detail = this.detail();
    if (!id || !detail || detail.status !== 'active') {
      return;
    }
    const seq = this.detailLoadSeq;
    await this.loadCandidates(id, seq);
  }

  onPausedChange(itemId: string, requestsPaused: boolean): void {
    this.items.update((list) =>
      list.map((i) => (i.id === itemId ? { ...i, requestsPaused } : i)),
    );
    if (this.selectedId() === itemId) {
      this.detail.update((d) => (d ? { ...d, requestsPaused } : d));
    }
  }

  openConfirmDeliveryDialog(): void {
    if (!this.canManageDeliverySession()) {
      return;
    }
    this.confirmDeliveryErrorKey.set(null);
    this.confirmDeliveryOpen.set(true);
  }

  closeConfirmDeliveryDialog(): void {
    if (this.confirmDeliverySubmitting()) {
      return;
    }
    this.confirmDeliveryOpen.set(false);
    this.confirmDeliveryErrorKey.set(null);
  }

  async onConfirmDelivery(): Promise<void> {
    const session = this.deliverySession();
    if (
      !session ||
      this.confirmDeliverySubmitting() ||
      !this.canManageDeliverySession()
    ) {
      return;
    }

    this.confirmDeliverySubmitting.set(true);
    this.confirmDeliveryErrorKey.set(null);

    try {
      await this.deliveryApi.deliverySessionsIdConfirmPost({ id: session.id });
      const confirmedId = this.selectedId();
      if (confirmedId) {
        this.items.update((list) =>
          list.map((i) => (i.id === confirmedId ? { ...i, status: 'completed' } : i)),
        );
      }
      await this.afterDeliverySessionMutation();
      if (this.detail()?.status === 'completed') {
        this.confirmDeliveryOpen.set(false);
      } else {
        this.confirmDeliveryErrorKey.set('delivery.detail.errors.action_failed');
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.confirmDeliveryErrorKey.set(
        mapDeliverySessionMutationError(err).errorKey,
      );
    } finally {
      this.confirmDeliverySubmitting.set(false);
    }
  }

  openCancelSessionDialog(): void {
    if (!this.canManageDeliverySession()) {
      return;
    }
    this.cancelSessionErrorKey.set(null);
    this.cancelSessionOpen.set(true);
  }

  closeCancelSessionDialog(): void {
    if (this.cancelSessionSubmitting()) {
      return;
    }
    this.cancelSessionOpen.set(false);
    this.cancelSessionErrorKey.set(null);
  }

  async onCancelSessionConfirm(noShow: boolean): Promise<void> {
    const session = this.deliverySession();
    if (!session || this.cancelSessionSubmitting()) {
      return;
    }

    this.cancelSessionSubmitting.set(true);
    this.cancelSessionErrorKey.set(null);

    try {
      await this.deliveryApi.deliverySessionsIdCancelPost({
        id: session.id,
        body: { noShow },
      });
      const cancelledId = this.selectedId();
      if (cancelledId) {
        this.items.update((list) =>
          list.map((i) => (i.id === cancelledId ? { ...i, status: 'active' } : i)),
        );
      }
      await this.afterDeliverySessionMutation();
      if (this.detail()?.status === 'active') {
        this.cancelSessionOpen.set(false);
      } else {
        this.cancelSessionErrorKey.set('delivery.detail.errors.action_failed');
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.cancelSessionErrorKey.set(
        mapDeliverySessionCancelError(err).errorKey,
      );
    } finally {
      this.cancelSessionSubmitting.set(false);
    }
  }

  openCancelDialog(): void {
    this.cancelErrorKey.set(null);
    this.cancelDialogOpen.set(true);
  }

  closeCancelDialog(): void {
    if (this.cancelling()) {
      return;
    }
    this.cancelDialogOpen.set(false);
    this.cancelErrorKey.set(null);
  }

  async onCancelConfirm(): Promise<void> {
    const id = this.selectedId();
    if (!id || this.cancelling()) {
      return;
    }

    this.cancelling.set(true);
    this.cancelErrorKey.set(null);

    try {
      await this.itemsApi.itemsIdDelete({ id });
      this.cancelDialogOpen.set(false);
      this.showCancelledSuccess.set(true);
      this.closeDetail();
      await this.loadPage();
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      const mapped = mapCancelItemError(err);
      this.cancelErrorKey.set(
        mapped.bannerKey ?? 'items.cancel.errors.generic',
      );
    } finally {
      this.cancelling.set(false);
    }
  }

  private clearSelectSuccess(): void {
    this.selectSuccess.set(null);
  }

  private async afterDeliverySessionMutation(): Promise<void> {
    const id = this.selectedId();
    await this.loadPage();
    if (!id) {
      return;
    }
    const item = this.items().find((i) => i.id === id);
    if (!item) {
      this.closeDetail();
      return;
    }
    if (item.status === 'completed') {
      this.activeTab.set('completed');
    } else if (item.status === 'active') {
      this.activeTab.set('active');
    } else if (item.status === 'reserved') {
      this.activeTab.set('reserved');
    }
    await this.loadDetail(id);
  }

  private async loadPage(): Promise<void> {
    this.loading.set(true);
    this.errorKey.set(null);
    try {
      const [itemsRes, sessionsRes] = await Promise.all([
        this.usersApi.usersMeItemsGet({ page: 1, limit: 50 }),
        this.usersApi.usersMeDeliverySessionsGet({
          role: 'donor',
          status: 'active',
          page: 1,
          limit: 50,
        }),
      ]);
      this.items.set(itemsRes.items);
      const map: Record<string, MyDeliverySession> = {};
      for (const s of sessionsRes.sessions) {
        map[s.itemId] = s;
      }
      this.sessionsByItemId.set(map);
      await this.openDeepLinkedItem();
    } catch {
      this.errorKey.set('items.my_objects.errors.load_failed');
    } finally {
      this.loading.set(false);
    }
  }

  private async openDeepLinkedItem(): Promise<void> {
    const itemId = this.route.snapshot.queryParamMap.get('itemId');
    if (!itemId) {
      return;
    }
    const item = this.items().find((i) => i.id === itemId);
    if (item) {
      this.selectItem(item);
    }
  }

  private async loadDetail(id: string): Promise<void> {
    const seq = ++this.detailLoadSeq;
    this.detailLoading.set(true);
    this.detailErrorKey.set(null);
    this.detail.set(null);
    this.candidates.set([]);
    this.candidatesErrorKey.set(null);
    this.deliverySession.set(null);
    this.selectedImageIndex.set(0);

    try {
      const res = await this.itemsApi.itemsIdGet({ id });
      if (seq !== this.detailLoadSeq) {
        return;
      }
      this.detail.set(res);

      if (res.status === 'active') {
        await this.loadCandidates(id, seq);
      }

      if (res.status === 'reserved') {
        const summary = this.sessionsByItemId()[id];
        if (summary) {
          try {
            const session = await this.deliveryApi.deliverySessionsIdGet({
              id: summary.id,
            });
            if (seq === this.detailLoadSeq) {
              this.deliverySession.set(session);
            }
          } catch {
            if (seq === this.detailLoadSeq) {
              this.deliverySession.set(null);
            }
          }
        }
      }
    } catch (err) {
      if (seq !== this.detailLoadSeq) {
        return;
      }
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.detailErrorKey.set('items.detail.errors.load_failed');
    } finally {
      if (seq === this.detailLoadSeq) {
        this.detailLoading.set(false);
      }
    }
  }

  private ensureItemVisibleInList(item: MyItem): void {
    const tab = this.activeTab();
    if (tab === 'all' || tab === item.status) {
      return;
    }
    this.activeTab.set(item.status === 'active' ? 'active' : 'all');
  }

  private syncItemIdQueryParam(itemId: string | null): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { itemId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private async loadCandidates(id: string, seq: number): Promise<void> {
    this.candidatesLoading.set(true);
    this.candidatesErrorKey.set(null);
    try {
      const ranked = await this.itemsApi.itemsIdRequestsGet({ id });
      if (seq === this.detailLoadSeq) {
        this.candidates.set(ranked.candidates ?? []);
      }
    } catch (err) {
      if (seq === this.detailLoadSeq) {
        this.candidates.set([]);
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.candidatesErrorKey.set(
            'items.my_objects.errors.candidates_forbidden',
          );
        } else {
          this.candidatesErrorKey.set(
            'items.my_objects.errors.candidates_load_failed',
          );
        }
      }
    } finally {
      if (seq === this.detailLoadSeq) {
        this.candidatesLoading.set(false);
      }
    }
  }
}
