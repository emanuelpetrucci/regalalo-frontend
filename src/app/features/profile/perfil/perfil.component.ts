import { DOCUMENT, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
  type ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { MyDeliverySession } from '../../../core/api/generated/models/my-delivery-session';
import type { MyItem } from '../../../core/api/generated/models/my-item';
import type { MyRequest } from '../../../core/api/generated/models/my-request';
import type { Pagination } from '../../../core/api/generated/models/pagination';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import type { ReputationEvent } from '../../../core/api/generated/models/reputation-event';
import type { UpdateProfileRequest } from '../../../core/api/generated/models/update-profile-request';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { LocaleService, type AppLocale } from '../../../core/i18n/locale.service';
import { SessionService } from '../../../core/services/session.service';
import {
  countActiveRequestsInWindow,
  MONTHLY_REQUEST_LIMIT,
} from '../../items/request-slots.util';
import { displayNameFromParts } from '../../../core/utils/user-display.util';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { ItemCategoryChipComponent } from '../../../shared/components/item-category-chip/item-category-chip.component';
import { ItemDetailModalComponent } from '../../../shared/components/item-detail-modal/item-detail-modal.component';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';
import { buildProfilePatchBody } from './profile-patch.util';
import { mapProfileUpdateError } from './profile-update-error.util';
import {
  normalizeItemCategory,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';

export type ProfileTab = 'donaciones' | 'solicitudes' | 'reputacion' | 'configuracion';

export type DonationsFilter = 'all' | 'active' | 'reserved' | 'completed' | 'cancelled';

export type RequestsFilter = 'all' | 'pending' | 'selected' | 'rejected' | 'cancelled';

/** Badge visual en lista (incluye entrega completada, paridad Perfil.html). */
export type DisplayRequestStatus = MyRequest['status'] | 'completed';

const POSTAL_PATTERN = /^\d{5}$/;
const RELOGIN_RETURN_KEY = 'rgl_relogin_return';
const SUPPORTED_LANGUAGES: AppLocale[] = ['es', 'ca', 'en'];

function optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string | null | undefined)?.trim() ?? '';
  if (!value) {
    return null;
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url: true };
    }
    return null;
  } catch {
    return { url: true };
  }
}

const DONATION_FILTERS: DonationsFilter[] = [
  'all',
  'active',
  'reserved',
  'completed',
  'cancelled',
];

const REQUEST_FILTERS: RequestsFilter[] = [
  'all',
  'pending',
  'selected',
  'rejected',
  'cancelled',
];

const DON_PAGE_LIMIT = 20;

const REQ_PAGE_LIMIT = 20;

const QUOTA_SLOT_INDICES = [0, 1, 2] as const;

@Component({
  selector: 'app-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoModule,
    NgOptimizedImage,
    RouterLink,
    ReactiveFormsModule,
    UserAvatarComponent,
    FieldInputComponent,
    LanguageSelectorComponent,
    ItemCategoryChipComponent,
    ItemDetailModalComponent,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private readonly usersApi = inject(UsersService);
  private readonly transloco = inject(TranslocoService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly locale = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly donationFilters = DONATION_FILTERS;
  readonly requestFilters = REQUEST_FILTERS;
  readonly quotaSlotIndices = QUOTA_SLOT_INDICES;
  readonly monthlyRequestLimit = MONTHLY_REQUEST_LIMIT;

  readonly loading = signal(true);
  readonly errorKey = signal<string | null>(null);
  readonly profile = signal<PrivateProfile | null>(null);
  readonly activeTab = signal<ProfileTab>('donaciones');

  readonly settingsSaving = signal(false);
  readonly settingsSuccess = signal(false);
  readonly settingsBannerKey = signal<string | null>(null);
  readonly settingsFieldErrors = signal<Record<string, string>>({});
  private readonly platformId = inject(PLATFORM_ID);
  private readonly doc = inject(DOCUMENT);
  private readonly settingsFormState = signal({ dirty: false, valid: false });
  private readonly settingsHasPatchChanges = signal(false);
  private readonly settingsPostalCode = signal('');

  readonly settingsForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    avatarUrl: ['', [optionalUrlValidator]],
    phone: [''],
    postalCode: ['', [Validators.required, Validators.pattern(POSTAL_PATTERN)]],
    preferredLanguage: ['es' as AppLocale, [Validators.required]],
  });

  readonly showPostalWarning = computed(() => {
    const p = this.profile();
    if (!p) {
      return false;
    }
    return this.settingsPostalCode() !== p.postalCode;
  });

  readonly canSaveSettings = computed(() => {
    const state = this.settingsFormState();
    return state.valid && this.settingsHasPatchChanges() && !this.settingsSaving();
  });

  readonly repEvents = signal<ReputationEvent[]>([]);
  readonly repLoading = signal(false);
  readonly repErrorKey = signal<string | null>(null);

  private repLoaded = false;

  readonly donItems = signal<MyItem[]>([]);
  readonly donLoading = signal(false);
  readonly donErrorKey = signal<string | null>(null);
  readonly donFilter = signal<DonationsFilter>('all');
  readonly donPage = signal(1);
  readonly donPagination = signal<Pagination | null>(null);
  readonly donLoadMoreErrorKey = signal<string | null>(null);

  private donLoaded = false;
  private donLoadSeq = 0;

  readonly reqItems = signal<MyRequest[]>([]);
  readonly reqLoading = signal(false);
  readonly reqErrorKey = signal<string | null>(null);
  readonly reqFilter = signal<RequestsFilter>('all');
  readonly reqPage = signal(1);
  readonly reqPagination = signal<Pagination | null>(null);
  readonly reqLoadMoreErrorKey = signal<string | null>(null);
  readonly reqActiveCount = signal(0);
  readonly reqQuotaReady = signal(false);
  readonly detailRequestItemId = signal<string | null>(null);

  private reqLoaded = false;
  private reqQuotaLoaded = false;
  private reqLoadSeq = 0;
  private receiverSessionsLoaded = false;
  private readonly receiverSessionByItemId = new Map<string, MyDeliverySession>();

  readonly hasMoreDonations = computed(() => {
    const pagination = this.donPagination();
    if (!pagination) {
      return false;
    }
    return (
      pagination.totalPages > 1 ||
      this.donItems().length < pagination.total
    );
  });

  readonly hasMoreRequests = computed(() => {
    const pagination = this.reqPagination();
    if (!pagination) {
      return false;
    }
    return (
      pagination.totalPages > 1 ||
      this.reqItems().length < pagination.total
    );
  });

  readonly reqQuotaExhausted = computed(
    () => this.reqActiveCount() >= MONTHLY_REQUEST_LIMIT,
  );

  readonly showRequestQuota = computed(
    () =>
      this.reqQuotaReady() &&
      (this.reqActiveCount() > 0 || this.reqItems().length > 0),
  );

  readonly repTotPos = computed(() =>
    this.repEvents()
      .filter((e) => e.delta > 0)
      .reduce((a, e) => a + e.delta, 0),
  );

  readonly repTotNeg = computed(() =>
    this.repEvents()
      .filter((e) => e.delta < 0)
      .reduce((a, e) => a + e.delta, 0),
  );

  readonly repSparkline = computed(() => this.repEvents().slice(0, 10).reverse());

  readonly displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return displayNameFromParts(p.firstName, p.lastName);
  });

  readonly memberSince = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const ms = new Date(p.createdAt).getTime();
    if (!Number.isFinite(ms)) return '—';
    return new Intl.DateTimeFormat(this.transloco.getActiveLang(), {
      month: 'long',
      year: 'numeric',
    }).format(ms);
  });

  readonly scoreDisplay = computed(() => {
    const p = this.profile();
    if (!p) return '0';
    const s = p.reputationScore;
    return s > 0 ? `+${s}` : String(s);
  });

  /** Paridad Perfil.html L352–353: >0 primary, 0 muted, <0 error */
  readonly scoreTone = computed<'good' | 'muted' | 'low'>(() => {
    const p = this.profile();
    if (!p) return 'muted';
    const s = p.reputationScore;
    if (s > 0) return 'good';
    if (s < 0) return 'low';
    return 'muted';
  });

  readonly showDegradedBanner = computed(() => {
    const p = this.profile();
    return p !== null && p.reputationScore < 0;
  });

  readonly showNewUserBanner = computed(() => {
    const p = this.profile();
    return (
      p !== null &&
      p.reputationScore === 0 &&
      p.totalDonated === 0 &&
      p.totalReceived === 0
    );
  });

  async ngOnInit(): Promise<void> {
    merge(this.settingsForm.valueChanges, this.settingsForm.statusChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.syncSettingsFormState();
        this.settingsSuccess.set(false);
      });
    await this.loadProfile();
    void this.loadDonations();
  }

  async reload(): Promise<void> {
    await this.loadProfile();
  }

  setTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
    if (tab === 'reputacion') {
      void this.loadReputation();
    } else if (tab === 'donaciones') {
      void this.loadDonations();
    } else if (tab === 'solicitudes') {
      void Promise.all([this.loadRequestQuota(), this.loadRequests()]);
    }
  }

  donationsFilterLabelKey(filter: DonationsFilter): string {
    return `items.my_objects.tabs.${filter}`;
  }

  requestsFilterLabelKey(filter: RequestsFilter): string {
    return `profile.requests.filters.${filter}`;
  }

  isDegraded(item: MyItem): boolean {
    return item.degradedAt != null;
  }

  showPausedSuffix(item: MyItem): boolean {
    return item.requestsPaused && item.status === 'active';
  }

  /** Paridad Perfil.html DonationCard L480: fecha localizada (p. ej. «15 feb 2026»). */
  formatItemDate(createdAt: string): string {
    const ms = new Date(createdAt).getTime();
    if (!Number.isFinite(ms)) return '—';
    return new Intl.DateTimeFormat(this.transloco.getActiveLang(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(ms);
  }

  conditionLabelKey(condition: MyItem['condition']): string {
    return `items.publish.condition_${condition}`;
  }

  itemCategory(item: MyItem): ItemCategory {
    return normalizeItemCategory(item.category);
  }

  /** Paridad Perfil.html: cancelado, completado (entrega/objeto), o estado de solicitud. */
  displayRequestStatus(req: MyRequest): DisplayRequestStatus {
    if (req.itemStatus === 'cancelled') {
      return 'cancelled';
    }
    if (req.itemStatus === 'completed') {
      return 'completed';
    }
    const session = this.receiverSessionByItemId.get(req.itemId);
    if (req.status === 'selected' && session?.status === 'completed') {
      return 'completed';
    }
    return req.status;
  }

  requestStatusLabelKey(status: DisplayRequestStatus): string {
    return `profile.requests.status.${status}`;
  }

  requestThumbnail(req: MyRequest): string | null {
    const images = req.images;
    return images.length > 0 ? images[0] : null;
  }

  isQuotaSlotFilled(slotIndex: number): boolean {
    return slotIndex < Math.min(this.reqActiveCount(), MONTHLY_REQUEST_LIMIT);
  }

  formatRequestDate(createdAt: string): string {
    return this.formatItemDate(createdAt);
  }

  requestRowAriaLabel(req: MyRequest): string {
    const status = this.displayRequestStatus(req);
    const session = this.receiverSessionByItemId.get(req.itemId);
    if (
      (status === 'selected' || status === 'completed') &&
      session
    ) {
      return this.transloco.translate('profile.requests.delivery_link_aria', {
        title: req.itemTitle,
      });
    }
    return req.itemTitle;
  }

  closeRequestDetail(): void {
    this.detailRequestItemId.set(null);
  }

  loadMoreRequests(): void {
    const pagination = this.reqPagination();
    if (!pagination || this.reqLoading()) {
      return;
    }
    if (this.reqPage() >= pagination.totalPages) {
      return;
    }
    this.reqPage.update((p) => p + 1);
    void this.loadRequests(true, true);
  }

  openRequest(req: MyRequest): void {
    const status = this.displayRequestStatus(req);
    const session = this.receiverSessionByItemId.get(req.itemId);
    if (status === 'selected' && session?.status === 'active') {
      void this.router.navigate(['/entregas', session.id]);
      return;
    }
    if (status === 'completed' && session) {
      void this.router.navigate(['/entregas', session.id]);
      return;
    }
    this.detailRequestItemId.set(req.itemId);
  }

  async retryRequests(): Promise<void> {
    this.reqLoaded = false;
    this.reqQuotaLoaded = false;
    this.reqQuotaReady.set(false);
    this.receiverSessionsLoaded = false;
    await Promise.all([this.loadRequestQuota(true), this.loadRequests(true)]);
  }

  changeRequestsFilter(filter: RequestsFilter): void {
    if (this.reqFilter() === filter) {
      return;
    }
    this.reqFilter.set(filter);
    this.reqPage.set(1);
    this.reqLoaded = false;
    void this.loadRequests(true);
  }

  changeDonationsFilter(filter: DonationsFilter): void {
    if (this.donFilter() === filter) {
      return;
    }
    this.donFilter.set(filter);
    this.donPage.set(1);
    this.donLoaded = false;
    void this.loadDonations(true);
  }

  loadMoreDonations(): void {
    const pagination = this.donPagination();
    if (!pagination || this.donLoading()) {
      return;
    }
    if (this.donPage() >= pagination.totalPages) {
      return;
    }
    this.donPage.update((p) => p + 1);
    void this.loadDonations(true, true);
  }

  openDonationItem(item: MyItem): void {
    void this.router.navigate(['/mis-objetos'], {
      queryParams: { itemId: item.id },
    });
  }

  async retryReputation(): Promise<void> {
    this.repLoaded = false;
    await this.loadReputation(true);
  }

  async retryDonations(): Promise<void> {
    this.donLoaded = false;
    await this.loadDonations(true);
  }

  formatDelta(delta: number): string {
    return delta > 0 ? `+${delta}` : String(delta);
  }

  eventLabelKey(type: ReputationEvent['type']): string {
    return type === 'delivery_completed'
      ? 'profile.reputation.event_delivery'
      : 'profile.reputation.event_no_show';
  }

  formatEventDate(createdAt: string): string {
    const ms = new Date(createdAt).getTime();
    if (!Number.isFinite(ms)) return '—';
    return new Intl.DateTimeFormat(this.transloco.getActiveLang(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(ms);
  }

  sparklineBarHeight(delta: number): number {
    return Math.min(100, (Math.abs(delta) / 40) * 100 + 15);
  }

  sparklineBarBackground(event: ReputationEvent, index: number): string {
    const historyLen = this.repEvents().length || 1;
    const alpha = 0.4 + (index / historyLen) * 0.6;
    return event.delta > 0
      ? `rgba(58, 115, 88, ${alpha})`
      : `rgba(179, 58, 42, ${alpha})`;
  }

  onPreferredLanguageSelect(lang: AppLocale): void {
    this.settingsForm.controls.preferredLanguage.setValue(lang);
    this.settingsForm.controls.preferredLanguage.markAsDirty();
    this.settingsForm.controls.preferredLanguage.markAsTouched();
  }

  emailVerifiedLabelKey(verified: boolean): string {
    return verified
      ? 'profile.account.email_verified_yes'
      : 'profile.account.email_verified_no';
  }

  settingsFieldError(controlName: keyof typeof this.settingsForm.controls): string | undefined {
    const apiError = this.settingsFieldErrors()[controlName];
    if (apiError) {
      return this.transloco.translate(apiError);
    }
    const control = this.settingsForm.controls[controlName];
    if (!control.touched && !control.dirty) {
      return undefined;
    }
    if (controlName === 'firstName' && control.hasError('minlength')) {
      return this.transloco.translate('profile.settings.validation.first_name_min');
    }
    if (controlName === 'lastName' && control.hasError('minlength')) {
      return this.transloco.translate('profile.settings.validation.last_name_min');
    }
    if (controlName === 'postalCode' && control.hasError('pattern')) {
      return this.transloco.translate('profile.settings.validation.postal_format');
    }
    if (controlName === 'avatarUrl' && control.hasError('url')) {
      return this.transloco.translate('profile.settings.error.field_invalid');
    }
    if (control.hasError('required')) {
      return this.transloco.translate('profile.settings.error.field_invalid');
    }
    return undefined;
  }

  buildPatchBody(): UpdateProfileRequest {
    const p = this.profile();
    if (!p) {
      return {};
    }
    const raw = this.settingsForm.getRawValue();
    return buildProfilePatchBody(
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        avatarUrl: raw.avatarUrl,
        phone: raw.phone,
        postalCode: raw.postalCode,
        preferredLanguage: raw.preferredLanguage,
      },
      p,
    );
  }

  async saveSettings(): Promise<void> {
    if (!this.canSaveSettings()) {
      return;
    }
    const p = this.profile();
    if (!p) {
      return;
    }

    const body = this.buildPatchBody();
    if (Object.keys(body).length === 0) {
      return;
    }

    const postalChanged = body.postalCode !== undefined;

    this.settingsSaving.set(true);
    this.settingsBannerKey.set(null);
    this.settingsFieldErrors.set({});
    this.settingsSuccess.set(false);

    try {
      const response = await this.usersApi.usersMePatch({ body });
      this.applyProfileUpdate(response, p, postalChanged);

      if (postalChanged && isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem(RELOGIN_RETURN_KEY, '/perfil');
      }

      this.settingsSuccess.set(true);
    } catch (err) {
      const mapped = mapProfileUpdateError(err);
      if (mapped.fields) {
        this.settingsFieldErrors.set(mapped.fields);
      }
      if (mapped.bannerKey) {
        this.settingsBannerKey.set(mapped.bannerKey);
      }
    } finally {
      this.settingsSaving.set(false);
    }
  }

  private applyProfileUpdate(
    response: {
      firstName: string;
      lastName: string;
      phone: string | null;
      avatarUrl: string | null;
      postalCode: string;
      preferredLanguage: string;
    },
    previous: PrivateProfile,
    postalChanged: boolean,
  ): void {
    this.profile.update((current) =>
      current
        ? {
            ...current,
            firstName: response.firstName,
            lastName: response.lastName,
            phone: response.phone,
            avatarUrl: response.avatarUrl,
            postalCode: response.postalCode,
            preferredLanguage: response.preferredLanguage,
          }
        : current,
    );

    this.populateSettingsForm(this.profile()!);

    const nameChanged =
      response.firstName !== previous.firstName ||
      response.lastName !== previous.lastName;
    const avatarChanged = response.avatarUrl !== previous.avatarUrl;

    if (!postalChanged && (nameChanged || avatarChanged)) {
      const user = this.session.getUser();
      if (user) {
        this.session.setUser({
          ...user,
          firstName: response.firstName,
          lastName: response.lastName,
          postalCode: response.postalCode,
        });
      }
    }

    const lang = response.preferredLanguage.trim().toLowerCase();
    if (lang !== previous.preferredLanguage.trim().toLowerCase()) {
      this.applyPreferredLanguageLocale(lang);
    }
  }

  private applyPreferredLanguageLocale(preferredLanguage: string): void {
    const lang = preferredLanguage.trim().toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(lang as AppLocale)) {
      this.locale.setLocale(lang as AppLocale);
    }
  }

  private syncSettingsFormState(): void {
    const dirty = this.settingsForm.dirty;
    const valid = this.settingsForm.valid;
    this.settingsFormState.set({ dirty, valid });
    this.settingsPostalCode.set(this.settingsForm.controls.postalCode.value);

    const p = this.profile();
    if (!p || !dirty) {
      this.settingsHasPatchChanges.set(false);
      return;
    }
    const raw = this.settingsForm.getRawValue();
    const patchKeys = Object.keys(
      buildProfilePatchBody(
        {
          firstName: raw.firstName,
          lastName: raw.lastName,
          avatarUrl: raw.avatarUrl,
          phone: raw.phone,
          postalCode: raw.postalCode,
          preferredLanguage: raw.preferredLanguage,
        },
        p,
      ),
    );
    this.settingsHasPatchChanges.set(patchKeys.length > 0);
  }

  private populateSettingsForm(p: PrivateProfile): void {
    this.settingsForm.reset({
      firstName: p.firstName,
      lastName: p.lastName,
      avatarUrl: p.avatarUrl ?? '',
      phone: p.phone ?? '',
      postalCode: p.postalCode,
      preferredLanguage: (SUPPORTED_LANGUAGES.includes(
        p.preferredLanguage as AppLocale,
      )
        ? p.preferredLanguage
        : 'es') as AppLocale,
    });
    this.settingsForm.markAsPristine();
    this.syncSettingsFormState();
    this.settingsFieldErrors.set({});
  }

  logout(): void {
    this.session.clearToken();
    this.doc.location.href = '/login';
  }

  async loadRequestQuota(force = false): Promise<void> {
    if (this.reqQuotaLoaded && !force) {
      return;
    }

    try {
      const [pendingRes, selectedRes] = await Promise.all([
        this.usersApi.usersMeRequestsGet({ status: 'pending', limit: 50 }),
        this.usersApi.usersMeRequestsGet({ status: 'selected', limit: 50 }),
      ]);
      this.reqActiveCount.set(
        countActiveRequestsInWindow([
          ...pendingRes.requests,
          ...selectedRes.requests,
        ]),
      );
      this.reqQuotaLoaded = true;
      this.reqQuotaReady.set(true);
      await this.loadReceiverSessions(force);
    } catch {
      this.reqQuotaReady.set(false);
    }
  }

  async loadRequests(force = false, append = false): Promise<void> {
    if (!force && !append && this.reqLoaded) {
      return;
    }
    if (this.reqLoading() && !force && !append) {
      return;
    }

    const filter = this.reqFilter();
    const params: {
      page: number;
      limit: number;
      status?: 'pending' | 'selected' | 'rejected' | 'cancelled';
    } = {
      page: this.reqPage(),
      limit: REQ_PAGE_LIMIT,
    };
    if (filter !== 'all') {
      params.status = filter;
    }

    const seq = ++this.reqLoadSeq;

    this.reqLoading.set(true);
    if (!append) {
      this.reqErrorKey.set(null);
      this.reqLoadMoreErrorKey.set(null);
      this.reqItems.set([]);
    } else {
      this.reqLoadMoreErrorKey.set(null);
    }

    try {
      const res = await this.usersApi.usersMeRequestsGet(params);
      if (seq !== this.reqLoadSeq) {
        return;
      }
      if (!res || !Array.isArray(res.requests) || !res.pagination) {
        throw new Error('Invalid my requests response');
      }
      this.reqItems.set(
        append ? [...this.reqItems(), ...res.requests] : res.requests,
      );
      this.reqPagination.set(res.pagination);
      this.reqLoaded = true;
    } catch {
      if (seq !== this.reqLoadSeq) {
        return;
      }
      if (append) {
        this.reqPage.update((p) => Math.max(1, p - 1));
        this.reqLoadMoreErrorKey.set('profile.requests.error_load');
      } else {
        this.reqErrorKey.set('profile.requests.error_load');
      }
    } finally {
      if (seq === this.reqLoadSeq) {
        this.reqLoading.set(false);
      }
    }
  }

  async loadDonations(force = false, append = false): Promise<void> {
    if (!force && !append && this.donLoaded) {
      return;
    }
    if (this.donLoading() && !force && !append) {
      return;
    }

    const filter = this.donFilter();
    const params: {
      page: number;
      limit: number;
      status?: 'active' | 'reserved' | 'completed' | 'cancelled';
    } = {
      page: this.donPage(),
      limit: DON_PAGE_LIMIT,
    };
    if (filter !== 'all') {
      params.status = filter;
    }

    const seq = ++this.donLoadSeq;

    this.donLoading.set(true);
    if (!append) {
      this.donErrorKey.set(null);
      this.donLoadMoreErrorKey.set(null);
      this.donItems.set([]);
    } else {
      this.donLoadMoreErrorKey.set(null);
    }

    try {
      const res = await this.usersApi.usersMeItemsGet(params);
      if (seq !== this.donLoadSeq) {
        return;
      }
      if (!res || !Array.isArray(res.items) || !res.pagination) {
        throw new Error('Invalid my items response');
      }
      this.donItems.set(
        append ? [...this.donItems(), ...res.items] : res.items,
      );
      this.donPagination.set(res.pagination);
      this.donLoaded = true;
    } catch {
      if (seq !== this.donLoadSeq) {
        return;
      }
      if (append) {
        this.donPage.update((p) => Math.max(1, p - 1));
        this.donLoadMoreErrorKey.set('profile.donations.error_load');
      } else {
        this.donErrorKey.set('profile.donations.error_load');
      }
    } finally {
      if (seq === this.donLoadSeq) {
        this.donLoading.set(false);
      }
    }
  }

  async loadReputation(force = false): Promise<void> {
    if (this.repLoaded && !force) {
      return;
    }
    if (this.repLoading() && !force) {
      return;
    }

    this.repLoading.set(true);
    this.repErrorKey.set(null);
    try {
      const res = await this.usersApi.usersMeReputationHistoryGet();
      if (!res || !Array.isArray(res.events)) {
        throw new Error('Invalid reputation history response');
      }
      this.repEvents.set(res.events);
      this.repLoaded = true;
    } catch {
      this.repErrorKey.set('profile.reputation.error_load');
    } finally {
      this.repLoading.set(false);
    }
  }

  private async loadReceiverSessions(force = false): Promise<void> {
    if (this.receiverSessionsLoaded && !force) {
      return;
    }

    try {
      const res = await this.usersApi.usersMeDeliverySessionsGet({ limit: 50 });
      this.receiverSessionByItemId.clear();
      const byItem = new Map<string, MyDeliverySession[]>();
      for (const session of res.sessions ?? []) {
        if (session.role !== 'receiver') {
          continue;
        }
        const list = byItem.get(session.itemId) ?? [];
        list.push(session);
        byItem.set(session.itemId, list);
      }
      for (const [itemId, sessions] of byItem) {
        const active = sessions.find((s) => s.status === 'active');
        const completed = sessions.find((s) => s.status === 'completed');
        const chosen = active ?? completed ?? sessions[0];
        if (chosen) {
          this.receiverSessionByItemId.set(itemId, chosen);
        }
      }
      this.receiverSessionsLoaded = true;
    } catch {
      this.receiverSessionByItemId.clear();
    }
  }

  private async loadProfile(): Promise<void> {
    this.loading.set(true);
    this.errorKey.set(null);
    try {
      const profile = await this.usersApi.usersMeGet();
      this.profile.set(profile);
      this.populateSettingsForm(profile);
      this.applyPreferredLanguageLocale(profile.preferredLanguage);
    } catch {
      this.errorKey.set('profile.errors.load');
    } finally {
      this.loading.set(false);
    }
  }
}
