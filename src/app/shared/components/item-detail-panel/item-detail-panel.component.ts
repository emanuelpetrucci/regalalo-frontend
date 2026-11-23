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
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { GetItemResponse } from '../../../core/api/generated/models/get-item-response';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import {
  countActiveRequestsInWindow,
  remainingRequestSlots,
} from '../../../features/items/request-slots.util';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import { mapCancelItemError } from '../../../features/items/cancel-item-error.util';
import { mapRequestItemError } from '../../../features/items/request-item-error.util';
import { environment } from '../../../../environments/environment';
import {
  isItemUuidV4,
  itemPublicPathSegment,
  itemPublicUrl,
} from '../../../core/utils/item-public-path.util';
import { ItemSeoService } from '../../../core/seo/item-seo.service';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { BtnComponent } from '../btn/btn.component';
import { ItemCancelDialogComponent } from '../item-cancel-dialog/item-cancel-dialog.component';
import { ItemDetailCandidatesPanelComponent } from '../item-detail-candidates-panel/item-detail-candidates-panel.component';
import { ItemDetailDonorControlsComponent } from '../item-detail-donor-controls/item-detail-donor-controls.component';
import { ItemDetailReceiverControlsComponent } from '../item-detail-receiver-controls/item-detail-receiver-controls.component';
import { ItemCategoryChipComponent } from '../item-category-chip/item-category-chip.component';
import { ItemConditionChipComponent } from '../item-condition-chip/item-condition-chip.component';
import { ItemCtaBlockComponent } from '../item-cta-block/item-cta-block.component';
import { ItemDistanceChipComponent } from '../item-distance-chip/item-distance-chip.component';
import { ItemDonorRowComponent } from '../item-donor-row/item-donor-row.component';
import { ItemImageGalleryComponent } from '../item-image-gallery/item-image-gallery.component';
import { ItemPauseControlComponent } from '../item-pause-control/item-pause-control.component';
import { RequestContactBottomSheetComponent } from '../../../features/items/components/request-contact-bottom-sheet/request-contact-bottom-sheet.component';
import { RequestContactStepComponent } from '../../../features/items/components/request-contact-step/request-contact-step.component';
import {
  readPendingRequestContact,
  writePendingRequestContact,
} from '../../../features/items/select-receiver-channel.util';
import { ItemSelectReceiverDialogComponent } from '../item-select-receiver-dialog/item-select-receiver-dialog.component';
import {
  ItemStatusBadgeComponent,
  type ItemStatusBadgeStatus,
} from '../item-status-badge/item-status-badge.component';
import { ShareDialogComponent } from '../share-dialog/share-dialog.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';
import { ConversionGateModalComponent } from '../conversion-gate-modal/conversion-gate-modal.component';

export type ItemDetailPresentation = 'page' | 'modal';

@Component({
  selector: 'app-item-detail-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslocoModule,
    AlertBoxComponent,
    BtnComponent,
    ItemImageGalleryComponent,
    ItemDonorRowComponent,
    ItemCancelDialogComponent,
    ItemPauseControlComponent,
    RequestContactBottomSheetComponent,
    RequestContactStepComponent,
    ShareDialogComponent,
    ItemConditionChipComponent,
    ItemCategoryChipComponent,
    ItemDistanceChipComponent,
    ItemCtaBlockComponent,
    ItemStatusBadgeComponent,
    ItemDetailDonorControlsComponent,
    ItemDetailReceiverControlsComponent,
    ItemDetailCandidatesPanelComponent,
    ItemSelectReceiverDialogComponent,
    ReportModalComponent,
    ConversionGateModalComponent,
  ],
  templateUrl: './item-detail-panel.component.html',
  styleUrl: './item-detail-panel.component.scss',
  host: {
    '(document:keydown.escape)': 'onDocumentEscape($event)',
    '[class.item-detail-panel--page]': 'presentation() === "page"',
    '[class.item-detail-panel--modal]': 'presentation() === "modal"',
  },
})
export class ItemDetailPanelComponent {
  private readonly itemsApi = inject(ItemsService);
  private readonly usersApi = inject(UsersService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);
  private readonly itemSeoService = inject(ItemSeoService);
  private loadSeq = 0;

  readonly itemId = input.required<string>();
  readonly presentation = input<ItemDetailPresentation>('page');
  readonly closed = output<void>();

  readonly item = signal<GetItemResponse | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly gone = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly selectedImageIndex = signal(0);
  readonly cancelDialogOpen = signal(false);
  readonly cancelling = signal(false);
  readonly cancelErrorKey = signal<string | null>(null);
  readonly contactSheetOpen = signal(false);
  readonly showContactStep = signal(false);
  readonly contactSheetFieldErrorKey = signal<string | null>(null);
  readonly pendingContactChannel = signal<string | null>(null);
  readonly requesting = signal(false);
  readonly requestErrorKey = signal<string | null>(null);
  readonly requestDone = signal(false);
  readonly remainingSlots = signal<number | null>(null);
  readonly shareDialogOpen = signal(false);
  readonly candidates = signal<RankedCandidate[]>([]);
  readonly candidatesLoading = signal(false);
  readonly candidatesErrorKey = signal<string | null>(null);
  readonly showCandidatesPanel = signal(false);
  readonly selectModalCandidate = signal<RankedCandidate | null>(null);
  readonly selectSubmitting = signal(false);
  readonly selectErrorKey = signal<string | null>(null);
  readonly deliveryCreated = signal(false);
  readonly reportModalOpen = signal(false);

  readonly isGuest = computed(() => this.session.user() === null);
  readonly conversionModalOpen = signal(false);

  readonly candidateCount = computed(() => this.candidates().length);

  readonly canReport = computed(
    () =>
      !this.isDonor() && this.session.isLoggedIn() && this.session.user()?.emailVerified === true,
  );

  readonly errorMessage = computed(() => {
    const key = this.errorKey();
    return key ? this.transloco.translate(key) : '';
  });

  readonly requestErrorMessage = computed(() => {
    const key = this.requestErrorKey();
    if (key) {
      return this.transloco.translate(key);
    }
    if (this.remainingSlots() === 0 && !this.isDonor()) {
      return this.transloco.translate('items.request.errors.limit_reached');
    }
    return '';
  });

  readonly distanceKm = computed(() => {
    const meters = this.item()?.distanceMeters;
    return meters != null ? formatDistanceKm(meters) : '—';
  });
  readonly locationName = computed(() => this.item()?.locationName ?? null);

  readonly itemCategory = computed(() => this.item()?.category ?? null);

  readonly displayStatus = computed((): ItemStatusBadgeStatus => {
    const current = this.item();
    if (!current) {
      return 'active';
    }
    if (current.requestsPaused && current.status === 'active') {
      return 'paused';
    }
    if (current.degradedAt && current.status === 'active') {
      return 'degraded';
    }
    return current.status;
  });

  readonly publishedDateLabel = computed(() => {
    const createdAt = this.item()?.createdAt;
    if (!createdAt) {
      return '—';
    }
    const days = this.daysSince(createdAt);
    if (this.isDonor()) {
      return this.transloco.translate('items.detail.published_days_ago', { days });
    }
    return this.transloco.translate('items.detail.days_ago', { days });
  });

  readonly isDegraded = computed(() => this.item()?.degradedAt != null);

  readonly isDonor = computed(() => {
    const current = this.item();
    const userId = this.session.user()?.id;
    return !!(current && userId && current.donor.id === userId);
  });

  readonly canManagePause = computed(() => {
    const current = this.item();
    return !!(this.isDonor() && current?.status === 'active');
  });

  readonly showRequestPendingState = computed(() => this.requestDone());

  readonly showRequestLimitState = computed(() => {
    if (this.requestErrorKey() === 'items.request.errors.limit_reached') {
      return true;
    }
    const slots = this.remainingSlots();
    const current = this.item();
    return (
      slots === 0 &&
      !!current &&
      !this.isDonor() &&
      current.status === 'active' &&
      !current.requestsPaused &&
      !this.requestDone()
    );
  });

  readonly canShowRequestCta = computed(() => {
    const current = this.item();
    return (
      !!current &&
      !this.isDonor() &&
      current.status === 'active' &&
      !current.requestsPaused &&
      !this.requestDone() &&
      !this.showRequestLimitState()
    );
  });

  readonly showPausedCta = computed(() => {
    const current = this.item();
    return !!current && !this.isDonor() && current.requestsPaused;
  });

  readonly canCancelItem = computed(() => {
    const current = this.item();
    return !!(this.isDonor() && current?.status === 'active');
  });

  readonly shareUrl = computed(() => {
    const current = this.item();
    if (!current) {
      return '';
    }
    return itemPublicUrl(environment.siteUrl, current);
  });

  readonly conversionReturnUrl = computed(() => {
    const current = this.item();
    if (!current) {
      return null;
    }
    const segment = itemPublicPathSegment(current);
    return segment ? `/items/${segment}` : null;
  });

  readonly canCancelItemWithSession = computed(() => {
    const current = this.item();
    return !!(this.isDonor() && current?.status === 'reserved');
  });

  readonly showPauseNotAvailable = computed(() => {
    const current = this.item();
    return !!(
      this.isDonor() &&
      current &&
      current.status !== 'active' &&
      current.status !== 'reserved'
    );
  });

  readonly showUnavailableCta = computed(() => {
    const current = this.item();
    return !!current && !this.isDonor() && !current.requestsPaused && current.status !== 'active';
  });

  private cancelTriggerEl: HTMLElement | null = null;
  private requestTriggerEl: HTMLElement | null = null;
  private reportTriggerEl: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const id = this.itemId();
      if (id) {
        void this.loadItem(id);
      }
    });
  }

  onDocumentEscape(event: Event): void {
    if (this.presentation() !== 'modal' || !(event instanceof KeyboardEvent)) {
      return;
    }
    if (this.reportModalOpen()) {
      return;
    }
    if (this.shareDialogOpen()) {
      event.preventDefault();
      this.closeShareDialog();
      return;
    }
    if (this.showContactStep()) {
      event.preventDefault();
      this.closeContactStep();
      return;
    }
    if (this.contactSheetOpen() || this.cancelDialogOpen() || this.requesting()) {
      return;
    }
    event.preventDefault();
    this.closed.emit();
  }

  openReportModal(event: Event): void {
    this.reportTriggerEl = ((event.currentTarget ?? event.target) as HTMLElement) ?? null;
    this.reportModalOpen.set(true);
  }

  onReportClosed(): void {
    this.reportModalOpen.set(false);
    this.reportTriggerEl?.focus();
    this.reportTriggerEl = null;
  }

  onReportSubmitted(): void {
    this.reportModalOpen.set(false);
    this.reportTriggerEl?.focus();
    this.reportTriggerEl = null;
  }

  async retry(): Promise<void> {
    const id = this.itemId();
    if (id) {
      await this.loadItem(id);
    }
  }

  onPausedChange(requestsPaused: boolean): void {
    this.item.update((i) => (i ? { ...i, requestsPaused } : i));
  }

  onInterestedClick(event?: Event): void {
    if (this.isGuest()) {
      this.requestTriggerEl = this.captureFocusTrigger(event);
      this.conversionModalOpen.set(true);
      return;
    }
    this.requestTriggerEl = this.captureFocusTrigger(event);
    this.requestErrorKey.set(null);
    if (this.presentation() === 'modal') {
      this.showContactStep.set(true);
      return;
    }
    this.contactSheetOpen.set(true);
  }

  closeContactStep(): void {
    if (this.requesting()) {
      return;
    }
    this.showContactStep.set(false);
    this.restoreRequestFocus();
  }

  onEditContactChannel(): void {
    this.requestErrorKey.set(null);
    this.showContactStep.set(true);
  }

  closeContactSheet(): void {
    if (this.requesting()) {
      return;
    }
    this.contactSheetOpen.set(false);
    this.contactSheetFieldErrorKey.set(null);
    this.restoreRequestFocus();
  }

  openShareDialog(): void {
    this.shareDialogOpen.set(true);
  }

  closeShareDialog(): void {
    this.shareDialogOpen.set(false);
  }

  toggleCandidatesPanel(): void {
    const next = !this.showCandidatesPanel();
    this.showCandidatesPanel.set(next);
    if (next && this.candidates().length === 0 && !this.candidatesLoading()) {
      void this.loadCandidates();
    }
  }

  onCandidateSelect(candidate: RankedCandidate): void {
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

  async onSelectConfirm(contactChannel: string): Promise<void> {
    const current = this.item();
    const candidate = this.selectModalCandidate();
    if (!current || !candidate || this.selectSubmitting()) {
      return;
    }

    this.selectSubmitting.set(true);
    this.selectErrorKey.set(null);

    try {
      await this.itemsApi.itemsIdRequestsRequestIdSelectPost({
        id: current.id,
        requestId: candidate.requestId,
        body: { contactChannel },
      });
      this.selectModalCandidate.set(null);
      this.showCandidatesPanel.set(false);
      this.deliveryCreated.set(true);
      await this.loadItem(current.id);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.selectErrorKey.set('items.my_objects.select_errors.generic');
    } finally {
      this.selectSubmitting.set(false);
    }
  }

  async retryCandidates(): Promise<void> {
    await this.loadCandidates();
  }

  private restoreRequestFocus(): void {
    this.requestTriggerEl?.focus();
    this.requestTriggerEl = null;
  }

  async onContactStepSubmit(contactChannel: string): Promise<void> {
    const current = this.item();
    if (!current || this.requesting()) {
      return;
    }

    if (this.requestDone()) {
      this.pendingContactChannel.set(contactChannel);
      writePendingRequestContact(current.id, contactChannel);
      this.showContactStep.set(false);
      this.restoreRequestFocus();
      return;
    }

    await this.submitRequest(contactChannel, () => {
      this.showContactStep.set(false);
    });
  }

  async onContactSheetSubmit(contactChannel: string): Promise<void> {
    await this.submitRequest(contactChannel, () => {
      this.contactSheetOpen.set(false);
    });
  }

  private async submitRequest(contactChannel: string, onSuccessClose: () => void): Promise<void> {
    const current = this.item();
    if (!current || this.requesting()) {
      return;
    }

    this.requesting.set(true);
    this.contactSheetFieldErrorKey.set(null);

    try {
      await this.itemsApi.itemsIdRequestsPost({ id: current.id, body: { contactChannel } });
      this.requestDone.set(true);
      this.pendingContactChannel.set(contactChannel);
      writePendingRequestContact(current.id, contactChannel);
      this.remainingSlots.update((n) => (n !== null ? Math.max(0, n - 1) : n));
      onSuccessClose();
      this.restoreRequestFocus();
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }

      if (err instanceof HttpErrorResponse && err.status === 400) {
        this.contactSheetFieldErrorKey.set('items.request.contact_channel.error.required');
        return;
      }

      const mapped = mapRequestItemError(err);
      if (mapped.markDone) {
        this.requestDone.set(true);
      }
      if (mapped.bannerKey) {
        this.requestErrorKey.set(mapped.bannerKey);
      }
      if (this.presentation() === 'modal') {
        this.showContactStep.set(false);
      } else {
        onSuccessClose();
      }
      this.restoreRequestFocus();
    } finally {
      this.requesting.set(false);
    }
  }

  openCancelDialog(event?: Event): void {
    this.cancelTriggerEl = this.captureFocusTrigger(event);
    this.cancelErrorKey.set(null);
    this.cancelDialogOpen.set(true);
  }

  private captureFocusTrigger(event?: Event): HTMLElement | null {
    const target = event?.currentTarget ?? event?.target;
    if (target instanceof HTMLElement) {
      const innerButton = target.querySelector('button');
      if (innerButton instanceof HTMLButtonElement) {
        return innerButton;
      }
      return target;
    }
    if (target instanceof SVGElement && target.parentElement instanceof HTMLElement) {
      return target.parentElement;
    }
    if (typeof document === 'undefined') {
      return null;
    }
    const active = document.activeElement;
    return active instanceof HTMLElement ? active : null;
  }

  closeCancelDialog(): void {
    if (this.cancelling()) {
      return;
    }
    this.cancelDialogOpen.set(false);
    this.cancelErrorKey.set(null);
    this.restoreCancelFocus();
  }

  private restoreCancelFocus(): void {
    this.cancelTriggerEl?.focus();
    this.cancelTriggerEl = null;
  }

  async onCancelConfirm(): Promise<void> {
    const current = this.item();
    if (!current || this.cancelling()) {
      return;
    }

    this.cancelling.set(true);
    this.cancelErrorKey.set(null);

    try {
      await this.itemsApi.itemsIdDelete({ id: current.id });
      this.cancelDialogOpen.set(false);
      if (this.presentation() === 'page') {
        await this.router.navigate(['/mis-objetos'], {
          queryParams: { cancelled: '1' },
        });
      } else {
        this.closed.emit();
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      const mapped = mapCancelItemError(err);
      this.cancelErrorKey.set(mapped.bannerKey ?? 'items.cancel.errors.generic');
    } finally {
      this.cancelling.set(false);
    }
  }

  private showNotFound(): void {
    this.loading.set(false);
    this.errorKey.set(null);
    this.notFound.set(true);
    this.item.set(null);
    this.selectedImageIndex.set(0);
  }

  private isItemNotFoundError(err: unknown): boolean {
    return err instanceof HttpErrorResponse && (err.status === 404 || err.status === 400);
  }

  private async loadItem(id: string): Promise<void> {
    const loaded = this.item();
    if (loaded && (loaded.id === id || loaded.slug === id)) {
      return;
    }
    const seq = ++this.loadSeq;
    this.loading.set(true);
    this.errorKey.set(null);
    this.notFound.set(false);
    this.gone.set(false);
    this.selectedImageIndex.set(0);
    this.requestDone.set(false);
    this.requestErrorKey.set(null);
    this.contactSheetOpen.set(false);
    this.showContactStep.set(false);
    this.contactSheetFieldErrorKey.set(null);
    this.pendingContactChannel.set(null);
    this.remainingSlots.set(null);
    this.candidates.set([]);
    this.candidatesErrorKey.set(null);
    this.deliveryCreated.set(false);
    this.showCandidatesPanel.set(false);
    this.selectModalCandidate.set(null);
    if (this.presentation() === 'page') {
      this.itemSeoService.clear();
    }

    try {
      const res = await this.itemsApi.itemsIdGet({ id });
      if (seq !== this.loadSeq) {
        return;
      }
      this.item.set(res);
      if (this.presentation() === 'page') {
        this.itemSeoService.apply(res);
      }
      if (this.presentation() === 'page' && isItemUuidV4(id) && res.slug && id === res.id) {
        try {
          await this.router.navigate(['/items', res.slug], { replaceUrl: true });
        } catch {
          // The item is already on screen. A failed canonical redirect must not clear it.
        }
        if (seq !== this.loadSeq) {
          return;
        }
      }
      void this.loadRequestSlots();
      if (this.isDonor()) {
        void this.loadCandidates();
      }
    } catch (err) {
      if (seq !== this.loadSeq) {
        return;
      }
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      if (err instanceof HttpErrorResponse && err.status === 410) {
        this.gone.set(true);
        this.loading.set(false);
        return;
      }
      if (this.isItemNotFoundError(err)) {
        this.showNotFound();
        return;
      }
      this.errorKey.set('items.detail.errors.load_failed');
      this.item.set(null);
    } finally {
      if (seq === this.loadSeq) {
        this.loading.set(false);
      }
    }
  }

  private daysSince(isoDate: string): number {
    const created = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  private async loadCandidates(): Promise<void> {
    const current = this.item();
    if (!current || !this.isDonor()) {
      this.candidates.set([]);
      return;
    }

    this.candidatesLoading.set(true);
    this.candidatesErrorKey.set(null);

    try {
      const res = await this.itemsApi.itemsIdRequestsGet({ id: current.id });
      this.candidates.set(res.candidates);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.candidates.set([]);
      this.candidatesErrorKey.set('items.my_objects.errors.candidates_load_failed');
    } finally {
      this.candidatesLoading.set(false);
    }
  }

  private async loadRequestSlots(): Promise<void> {
    if (!this.session.user() || this.isDonor()) {
      this.remainingSlots.set(null);
      return;
    }

    const itemId = this.item()?.id;
    if (!itemId) {
      return;
    }

    try {
      const [pendingRes, selectedRes] = await Promise.all([
        this.usersApi.usersMeRequestsGet({ status: 'pending', limit: 50 }),
        this.usersApi.usersMeRequestsGet({ status: 'selected', limit: 50 }),
      ]);
      const activeRequests = [...pendingRes.requests, ...selectedRes.requests];
      const active = countActiveRequestsInWindow(activeRequests);
      this.remainingSlots.set(remainingRequestSlots(active));
      if (activeRequests.some((r) => r.itemId === itemId)) {
        this.requestDone.set(true);
        const stored = readPendingRequestContact(itemId);
        if (stored) {
          this.pendingContactChannel.set(stored);
        }
      }
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      this.remainingSlots.set(null);
    }
  }
}
