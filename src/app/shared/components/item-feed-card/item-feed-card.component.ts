import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { ItemSummary } from '../../../core/api/generated/models/item-summary';
import { SessionService } from '../../../core/services/session.service';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import { itemPublicPathSegment } from '../../../core/utils/item-public-path.util';
import {
  normalizeItemCategory,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';
import { ItemCategoryChipComponent } from '../item-category-chip/item-category-chip.component';
import { ItemConditionChipComponent } from '../item-condition-chip/item-condition-chip.component';
import { ItemDistanceChipComponent } from '../item-distance-chip/item-distance-chip.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-item-feed-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    TranslocoModule,
    ItemCategoryChipComponent,
    ItemConditionChipComponent,
    ItemDistanceChipComponent,
    ReportModalComponent,
  ],
  templateUrl: './item-feed-card.component.html',
  styleUrl: './item-feed-card.component.scss',
  host: {
    '(keydown.escape)': 'closeMenu()',
  },
})
export class ItemFeedCardComponent {
  private readonly session = inject(SessionService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  readonly item = input.required<ItemSummary>();
  readonly openInModal = input(false);
  readonly open = output<string>();

  readonly canReport = computed(
    () => this.session.isLoggedIn() && this.session.user()?.emailVerified === true,
  );
  readonly menuOpen = signal(false);
  readonly reportModalOpen = signal(false);

  private reportTriggerEl: HTMLElement | null = null;

  readonly imageUrl = computed(() => this.item().images[0] ?? null);
  readonly isDegraded = computed(() => this.item().degradedAt != null);
  readonly itemCategory = computed<ItemCategory>(() =>
    normalizeItemCategory((this.item() as { category?: unknown }).category),
  );
  readonly distanceKm = computed(() => {
    const d = this.item().distanceMeters;
    return d != null ? formatDistanceKm(d) : null;
  });
  readonly locationName = computed(() => this.item().locationName ?? null);
  readonly detailLink = computed(() => {
    const segment = itemPublicPathSegment(this.item());
    return segment ? (['/items', segment] as const) : null;
  });

  onCardClick(): void {
    const segment = itemPublicPathSegment(this.item());
    if (segment) {
      this.open.emit(segment);
    }
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    const opening = !this.menuOpen();
    this.menuOpen.update((v) => !v);
    if (opening) {
      afterNextRender(
        () => {
          (this.el.nativeElement.querySelector('.feed-card__ctx-item') as HTMLElement | null)?.focus();
        },
        { injector: this.injector },
      );
    }
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  onCtxFocusOut(event: FocusEvent): void {
    const container = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as HTMLElement | null;
    if (!container.contains(related)) {
      this.menuOpen.set(false);
    }
  }

  openReportModal(_event: Event): void {
    this.reportTriggerEl =
      (this.el.nativeElement.querySelector('.feed-card__ctx-btn') as HTMLElement | null) ?? null;
    this.menuOpen.set(false);
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
}
