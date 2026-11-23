import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../../environments/environment';
import type { PublishItemMultipart } from '../../../core/api/generated/models/publish-item-multipart';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import {
  ITEM_CATEGORIES,
  ITEM_WEIGHT_RANGES,
  itemCategoryLabelKey,
  itemWeightRangeLabelKey,
  type ItemCategory,
  type ItemWeightRange,
} from '../../../core/utils/item-category-label.util';
import { itemPublicUrl } from '../../../core/utils/item-public-path.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { ImagePickerComponent } from '../../../shared/components/image-picker/image-picker.component';
import { AnalyticsEventsService } from '../../../core/services/analytics-events.service';
import { mapPublishError } from './publish-error.util';

const POSTAL_PATTERN = /^\d{5}$/;

function nonWhitespaceValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}
const CONDITIONS: PublishItemMultipart['condition'][] = [
  'new',
  'like_new',
  'good',
  'fair',
];

type StepNum = 1 | 2 | 3;
type FormField =
  | 'title'
  | 'description'
  | 'condition'
  | 'category'
  | 'weightRange'
  | 'postalCode';
type ServerFieldKey = FormField | 'images';
type ShareNetworkId = 'whatsapp' | 'facebook' | 'twitter';

interface PublishShareNetwork {
  id: ShareNetworkId;
  labelKey: string;
  href: string;
}

@Component({
  selector: 'app-publicar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
    ImagePickerComponent,
  ],
  templateUrl: './publicar.component.html',
  styleUrl: './publicar.component.scss',
})
export class PublicarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly itemsApi = inject(ItemsService);
  private readonly analytics = inject(AnalyticsEventsService);
  private readonly usersApi = inject(UsersService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly step = signal<StepNum>(1);
  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly publishedItemId = signal<string | null>(null);
  readonly publishedItemSlug = signal<string | null>(null);
  readonly imageBlobs = signal<Blob[]>([]);
  readonly photosError = signal<string | null>(null);
  readonly serverFieldErrorKeys = signal<Record<string, string>>({});
  readonly previewUrl = signal<string | null>(null);

  readonly conditions = CONDITIONS;
  readonly categories = ITEM_CATEGORIES;
  readonly weightRanges = ITEM_WEIGHT_RANGES;
  readonly itemCategoryLabelKey = itemCategoryLabelKey;
  readonly itemWeightRangeLabelKey = itemWeightRangeLabelKey;

  readonly form = this.fb.nonNullable.group({
    title: [
      '',
      [Validators.required, Validators.maxLength(100), nonWhitespaceValidator],
    ],
    description: [
      '',
      [
        Validators.required,
        Validators.maxLength(1000),
        nonWhitespaceValidator,
      ],
    ],
    condition: ['good' as PublishItemMultipart['condition'], Validators.required],
    category: ['', Validators.required],
    weightRange: ['', Validators.required],
    postalCode: ['', [Validators.required, Validators.pattern(POSTAL_PATTERN)]],
  });

  readonly progressPercent = computed(() => (this.step() / 3) * 100);

  readonly stepTitleKey = computed(() => {
    const keys: Record<StepNum, string> = {
      1: 'items.publish.step1_title',
      2: 'items.publish.step2_title',
      3: 'items.publish.step3_title',
    };
    return keys[this.step()];
  });

  readonly titleLength = computed(
    () => this.form.controls.title.value.length,
  );
  readonly descriptionLength = computed(
    () => this.form.controls.description.value.length,
  );

  readonly photoCount = computed(() => this.imageBlobs().length);

  readonly conditionLabelKey = computed(() => {
    const c = this.form.controls.condition.value;
    return `items.publish.condition_${c}`;
  });

  readonly categoryLabelKey = computed(() => {
    const c = this.form.controls.category.value;
    if (!c) return '';
    return itemCategoryLabelKey(c as ItemCategory);
  });

  readonly weightRangeLabelKey = computed(() => {
    const w = this.form.controls.weightRange.value;
    if (!w) return '';
    return itemWeightRangeLabelKey(w as ItemWeightRange);
  });

  readonly shareModalOpen = computed(() => this.publishedItemId() !== null);

  readonly publishShareText = computed(() =>
    this.transloco.translate('items.publish.share.message', {
      title: this.form.controls.title.value.trim(),
    }),
  );

  readonly publishShareUrl = computed(() =>
    itemPublicUrl(environment.siteUrl, {
      slug: this.publishedItemSlug(),
      id: this.publishedItemId(),
    }),
  );

  readonly publishShareNetworks = computed<PublishShareNetwork[]>(() => {
    const text = this.publishShareText();
    const whatsappUrl = this.buildTrackedShareUrl('whatsapp');
    const facebookUrl = this.buildTrackedShareUrl('facebook');
    const twitterUrl = this.buildTrackedShareUrl('twitter');
    return [
      {
        id: 'whatsapp',
        labelKey: 'items.publish.share.whatsapp',
        href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${whatsappUrl}`)}`,
      },
      {
        id: 'facebook',
        labelKey: 'items.publish.share.facebook',
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}&quote=${encodeURIComponent(text)}`,
      },
      {
        id: 'twitter',
        labelKey: 'items.publish.share.twitter',
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(twitterUrl)}`,
      },
    ];
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.revokePreview();
    });

    void this.prefillFromProfile();

    (['title', 'description', 'postalCode', 'category', 'weightRange'] as const).forEach(
      (key) => {
        this.form
          .get(key)
          ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.clearServerField(key));
      },
    );

    this.form.controls.condition.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clearServerField('condition'));
  }

  private async prefillFromProfile(): Promise<void> {
    try {
      const profile = await this.usersApi.usersMeGet();
      const postal = profile.postalCode?.trim();
      if (postal && !this.form.controls.postalCode.value.trim()) {
        this.form.controls.postalCode.setValue(postal);
      }
    } catch {
      // El usuario puede introducir el código postal manualmente.
    }
  }

  fieldError(controlName: FormField): string | undefined {
    const serverKey = this.serverFieldErrorKeys()[controlName];
    if (serverKey) {
      return this.transloco.translate(serverKey);
    }
    const control = this.form.get(controlName);
    if (!control || (!control.touched && !control.dirty) || control.valid) {
      return undefined;
    }
    const prefix = 'items.publish.validation';
    if (controlName === 'title') {
      return this.transloco.translate(
        control.hasError('required') || control.hasError('whitespace')
          ? `${prefix}.title_required`
          : `${prefix}.title_max`,
      );
    }
    if (controlName === 'description') {
      return this.transloco.translate(
        control.hasError('required') || control.hasError('whitespace')
          ? `${prefix}.description_required`
          : `${prefix}.description_max`,
      );
    }
    if (controlName === 'postalCode') {
      return this.transloco.translate(
        control.hasError('required')
          ? `${prefix}.postal_required`
          : `${prefix}.postal_format`,
      );
    }
    if (controlName === 'category') {
      return this.transloco.translate(`${prefix}.category_required`);
    }
    if (controlName === 'weightRange') {
      return this.transloco.translate(`${prefix}.weight_range_required`);
    }
    return undefined;
  }

  setCondition(value: PublishItemMultipart['condition']): void {
    this.form.controls.condition.setValue(value);
    this.form.controls.condition.markAsTouched();
  }

  isConditionSelected(value: PublishItemMultipart['condition']): boolean {
    return this.form.controls.condition.value === value;
  }

  photosErrorMessage(): string | null {
    const client = this.photosError();
    if (client) return client;
    const serverKey = this.serverFieldErrorKeys()['images'];
    return serverKey ? this.transloco.translate(serverKey) : null;
  }

  onImages(blobs: Blob[]): void {
    this.imageBlobs.set(blobs);
    if (blobs.length > 0) {
      this.photosError.set(null);
      this.clearServerField('images');
    }
    if (this.step() === 3) {
      this.updatePreviewUrl(blobs[0] ?? null);
    }
  }

  onFormEnter(event: Event): void {
    if (this.step() < 3) {
      event.preventDefault();
    }
  }

  goBack(): void {
    if (this.submitting()) return;
    this.bannerError.set(null);
    this.photosError.set(null);
    this.serverFieldErrorKeys.set({});
    if (this.step() === 3) {
      this.revokePreview();
    }
    const prev = this.step() - 1;
    if (prev >= 1) {
      this.step.set(prev as StepNum);
    }
  }

  async continue(): Promise<void> {
    if (this.submitting()) return;
    this.bannerError.set(null);

    if (this.step() === 1) {
      (['title', 'description', 'postalCode', 'category', 'weightRange'] as const).forEach(
        (k) => this.form.get(k)?.markAsTouched(),
      );
      this.form.controls.condition.markAsTouched();
      if (
        this.form.controls.title.invalid ||
        this.form.controls.description.invalid ||
        this.form.controls.postalCode.invalid ||
        this.form.controls.category.invalid ||
        this.form.controls.weightRange.invalid ||
        !this.form.controls.condition.value
      ) {
        return;
      }
      this.step.set(2);
      return;
    }

    if (this.step() === 2) {
      if (this.imageBlobs().length < 1) {
        this.photosError.set(
          this.transloco.translate('items.publish.errors.photos_required'),
        );
        return;
      }
      this.photosError.set(null);
      this.updatePreviewUrl(this.imageBlobs()[0] ?? null);
      this.step.set(3);
    }
  }

  async publish(): Promise<void> {
    if (this.inFlight || this.step() !== 3) return;
    this.inFlight = true;
    this.submitting.set(true);

    this.bannerError.set(null);
    this.successMessage.set(null);
    this.serverFieldErrorKeys.set({});
    this.form.markAllAsTouched();

    if (this.form.invalid || this.imageBlobs().length < 1) {
      if (this.imageBlobs().length < 1) {
        this.photosError.set(
          this.transloco.translate('items.publish.errors.photos_required'),
        );
      }
      this.submitting.set(false);
      this.inFlight = false;
      return;
    }
    try {
      const { title, description, condition, category, weightRange, postalCode } =
        this.form.getRawValue();
      const body: PublishItemMultipart = {
        title: title.trim(),
        description: description.trim(),
        condition,
        category: category as PublishItemMultipart['category'],
        weightRange: weightRange as PublishItemMultipart['weightRange'],
        postalCode: postalCode.trim(),
        images: this.imageBlobs(),
      };

      const res = await this.itemsApi.itemsPost({ body });

      if (this.destroyed) return;

      this.successMessage.set(
        this.transloco.translate('items.publish.success.title'),
      );
      this.publishedItemId.set(res.id);
      this.publishedItemSlug.set(res.slug);
      this.analytics.trackItemPublished(res.id);
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      const mapped = mapPublishError(err);
      if (mapped.fields) {
        this.serverFieldErrorKeys.set(mapped.fields);
        this.step.set(this.earliestStepForFields(mapped.fields));
      }
      if (mapped.bannerKey) {
        this.bannerError.set(this.transloco.translate(mapped.bannerKey));
      } else if (!mapped.fields) {
        this.bannerError.set(
          this.transloco.translate('items.publish.errors.generic'),
        );
      }
    } finally {
      this.submitting.set(false);
      this.inFlight = false;
    }
  }

  private earliestStepForFields(
    fields: Record<string, string>,
  ): StepNum {
    let min: StepNum = 3;
    for (const key of Object.keys(fields)) {
      if (key === 'images') {
        min = Math.min(min, 2) as StepNum;
      } else {
        min = 1;
      }
    }
    return min;
  }

  private clearServerField(key: ServerFieldKey): void {
    if (this.serverFieldErrorKeys()[key]) {
      const next = { ...this.serverFieldErrorKeys() };
      delete next[key];
      this.serverFieldErrorKeys.set(next);
    }
    this.bannerError.set(null);
  }

  private updatePreviewUrl(blob: Blob | null): void {
    this.revokePreview();
    if (blob) {
      this.previewUrl.set(URL.createObjectURL(blob));
    }
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrl.set(null);
    }
  }

  async goToMyItemsFromShareModal(): Promise<void> {
    const itemId = this.publishedItemId();
    this.publishedItemId.set(null);
    this.publishedItemSlug.set(null);
    await this.router.navigate(['/mis-objetos'], {
      queryParams: itemId ? { published: itemId } : undefined,
    });
  }

  private buildTrackedShareUrl(source: ShareNetworkId): string {
    const rawUrl = this.publishShareUrl();
    if (!rawUrl) {
      return rawUrl;
    }
    try {
      const parsed = new URL(rawUrl);
      parsed.searchParams.set('utm_source', source);
      parsed.searchParams.set('utm_medium', 'social');
      parsed.searchParams.set('utm_campaign', 'item_share_post_publish');
      parsed.searchParams.set('utm_content', 'publicar_success_modal');
      return parsed.toString();
    } catch {
      const separator = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${separator}utm_source=${source}&utm_medium=social&utm_campaign=item_share_post_publish&utm_content=publicar_success_modal`;
    }
  }
}
