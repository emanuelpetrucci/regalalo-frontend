import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { ItemSummary } from '../../../core/api/generated/models/item-summary';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { ExplorarSeoService } from '../../../core/seo/explorar-seo.service';
import { SessionService } from '../../../core/services/session.service';
import {
  ITEM_CATEGORIES,
  normalizeItemCategory,
} from '../../../core/utils/item-category-label.util';
import type { ItemCategory } from '../../../core/utils/item-category-label.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { ItemDetailModalComponent } from '../../../shared/components/item-detail-modal/item-detail-modal.component';
import { ItemFeedCardComponent } from '../../../shared/components/item-feed-card/item-feed-card.component';
import { FeedGlobalBannerComponent } from '../components/feed-global-banner/feed-global-banner.component';

const PAGE_LIMIT = 20;

type ConditionFilter = 'all' | ItemSummary['condition'];
type CategoryFilter = 'all' | ItemCategory;

const CONDITION_FILTERS: ConditionFilter[] = [
  'all',
  'new',
  'like_new',
  'good',
  'fair',
];
const CATEGORY_FILTERS: readonly CategoryFilter[] = ['all', ...ITEM_CATEGORIES];

@Component({
  selector: 'app-explorar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    TranslocoModule,
    AlertBoxComponent,
    BtnComponent,
    ItemFeedCardComponent,
    ItemDetailModalComponent,
    FeedGlobalBannerComponent,
  ],
  templateUrl: './explorar.component.html',
  styleUrl: './explorar.component.scss',
})
export class ExplorarComponent implements OnInit {
  private readonly itemsApi = inject(ItemsService);
  private readonly transloco = inject(TranslocoService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly explorarSeo = inject(ExplorarSeoService);

  readonly isGuest = computed(() => this.session.user() === null);

  readonly items = signal<ItemSummary[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(0);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly errorKey = signal<string | null>(null);
  readonly search = signal('');
  readonly conditionFilter = signal<ConditionFilter>('all');
  readonly categoryFilter = signal<CategoryFilter>('all');
  readonly detailItemId = signal<string | null>(null);

  readonly conditionFilters = CONDITION_FILTERS;
  readonly categoryFilters = CATEGORY_FILTERS;

  private loadGeneration = 0;

  readonly errorMessage = computed(() => {
    const key = this.errorKey();
    return key ? this.transloco.translate(key) : '';
  });

  readonly filteredItems = computed(() => {
    let list = [...this.items()];
    const condition = this.conditionFilter();
    if (condition !== 'all') {
      list = list.filter((item) => item.condition === condition);
    }
    const category = this.categoryFilter();
    if (category !== 'all') {
      list = list.filter((item) => this.itemCategory(item) === category);
    }
    const q = this.search().trim().toLowerCase();
    if (q) {
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }
    list.sort((a, b) => (a.degradedAt ? 1 : 0) - (b.degradedAt ? 1 : 0));
    return list;
  });

  readonly filteredCount = computed(() => this.filteredItems().length);

  readonly hasMore = computed(() => this.page() < this.totalPages());
  readonly showEmpty = computed(
    () =>
      !this.loading() &&
      !this.errorKey() &&
      this.filteredItems().length === 0,
  );
  readonly showGrid = computed(
    () => !this.loading() && this.filteredItems().length > 0,
  );

  ngOnInit(): void {
    this.explorarSeo.apply();
    void this.loadPage(1, false);
  }

  setConditionFilter(value: ConditionFilter): void {
    this.conditionFilter.set(value);
  }

  setCategoryFilter(value: CategoryFilter): void {
    this.categoryFilter.set(value);
  }

  conditionLabelKey(value: ConditionFilter): string {
    if (value === 'all') {
      return 'items.explore.filter_all';
    }
    return `items.publish.condition_${value}`;
  }

  categoryLabelKey(value: CategoryFilter): string {
    if (value === 'all') {
      return 'items.explore.filter_category_all';
    }
    return `items.category.${value}`;
  }

  private itemCategory(item: ItemSummary): ItemCategory {
    return normalizeItemCategory((item as { category?: unknown }).category);
  }

  openDetail(itemId: string): void {
    this.detailItemId.set(itemId);
  }

  closeDetail(): void {
    this.detailItemId.set(null);
    this.explorarSeo.apply();
  }

  async loadMore(): Promise<void> {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }
    await this.loadPage(this.page() + 1, true);
  }

  async retry(): Promise<void> {
    this.errorKey.set(null);
    if (this.items().length === 0) {
      await this.loadPage(1, false);
      return;
    }
    if (this.hasMore()) {
      await this.loadPage(this.page() + 1, true);
    } else {
      await this.loadPage(1, false);
    }
  }

  private async loadPage(page: number, append: boolean): Promise<void> {
    const generation = ++this.loadGeneration;

    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
      this.errorKey.set(null);
    }

    try {
      const res = await this.itemsApi.itemsGet({ page, limit: PAGE_LIMIT });
      if (generation !== this.loadGeneration) {
        return;
      }
      if (append) {
        this.items.update((prev) => [...prev, ...res.items]);
      } else {
        this.items.set(res.items);
      }
      this.page.set(res.pagination.page);
      this.total.set(res.pagination.total);
      this.totalPages.set(res.pagination.totalPages);
      this.errorKey.set(null);
    } catch (err) {
      if (generation !== this.loadGeneration) {
        return;
      }
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return;
      }
      if (err instanceof HttpErrorResponse && err.status === 400 && !append) {
        this.page.set(1);
      }
      this.errorKey.set('items.explore.errors.load_failed');
    } finally {
      if (generation === this.loadGeneration) {
        this.loading.set(false);
        this.loadingMore.set(false);
      }
    }
  }

  goPublish(): void {
    void this.router.navigate(['/mis-objetos/publicar']);
  }
}
