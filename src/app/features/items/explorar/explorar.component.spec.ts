import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { ItemSummary } from '../../../core/api/generated/models/item-summary';
import type { ListItemsResponse } from '../../../core/api/generated/models/list-items-response';
import { ItemsService } from '../../../core/api/generated/services/items.service';
import { ExplorarSeoService } from '../../../core/seo/explorar-seo.service';
import { ExplorarComponent } from './explorar.component';

const exploreI18n = {
  title: 'Tablón',
  subtitle: '{{count}} objetos cerca de ti · radio 50 km',
  subtitle_one: '1 objeto cerca de ti · radio 50 km',
  distance_km: '{{km}} km',
  degraded_badge: 'lleva tiempo aquí',
  empty_title: 'Nada por aquí todavía',
  empty_body: 'No hay objetos disponibles cerca de ti en este momento.',
  empty_cta: 'Publicar un objeto',
  load_more: 'Cargar más',
  loading: 'Cargando objetos…',
  image_alt: 'Foto de {{title}}',
  category_filters_label: 'Filtrar por categoría',
  filter_category_all: 'Todas las categorías',
  errors: {
    load_failed: 'No se pudieron cargar los objetos.',
    retry: 'Reintentar',
  },
};

const esJson = {
  items: {
    category: {
      furniture: 'Muebles',
      electronics: 'Electrónica',
      clothing: 'Ropa y calzado',
      books: 'Libros y material educativo',
      toys: 'Juguetes',
      kitchen: 'Cocina y hogar',
      sports: 'Deporte y ocio',
      tools: 'Herramientas',
      other: 'Otros',
    },
    explore: exploreI18n,
    publish: {
      condition_new: 'A estrenar',
      condition_like_new: 'Como nuevo',
      condition_good: 'Buen estado',
      condition_fair: 'Aceptable',
    },
  },
};

const page1: ListItemsResponse = {
  items: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'objeto-a',
      title: 'Objeto A',
      condition: 'good',
      category: 'other',
      createdAt: '2026-05-01T10:00:00.000Z',
      degradedAt: null,
      distanceMeters: 1000,
      locationName: null,
      images: [],
    },
  ],
  pagination: { total: 2, page: 1, limit: 20, totalPages: 2 },
};

const page2: ListItemsResponse = {
  items: [
    {
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'objeto-b',
      title: 'Objeto B',
      condition: 'fair',
      category: 'tools',
      createdAt: '2026-05-02T10:00:00.000Z',
      degradedAt: null,
      distanceMeters: 2000,
      locationName: null,
      images: [],
    },
  ],
  pagination: { total: 2, page: 2, limit: 20, totalPages: 2 },
};

describe('ExplorarComponent', () => {
  let itemsGet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    itemsGet = vi.fn();
    await TestBed.configureTestingModule({
      imports: [
        ExplorarComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([{ path: 'explorar', component: ExplorarComponent }]),
        { provide: ItemsService, useValue: { itemsGet } },
      ],
    }).compileComponents();
  });

  function createFixture() {
    const fixture = TestBed.createComponent(ExplorarComponent);
    fixture.detectChanges();
    return fixture;
  }

  async function waitForLoad(
    fixture: ReturnType<typeof createFixture>,
  ): Promise<void> {
    for (let i = 0; i < 50 && fixture.componentInstance.loading(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
    }
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('loads first page on init', async () => {
    itemsGet.mockResolvedValueOnce(page1);
    const fixture = createFixture();
    await waitForLoad(fixture);
    expect(itemsGet).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(fixture.componentInstance.items().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Objeto A');
  });

  it('appends page 2 when loading more', async () => {
    itemsGet.mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);
    const fixture = createFixture();
    await waitForLoad(fixture);

    await fixture.componentInstance.loadMore();
    for (let i = 0; i < 50 && fixture.componentInstance.loadingMore(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
    }
    fixture.detectChanges();

    expect(itemsGet).toHaveBeenLastCalledWith({ page: 2, limit: 20 });
    expect(fixture.componentInstance.items().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Objeto B');
  });

  it('shows empty state when no items', async () => {
    itemsGet.mockResolvedValueOnce({
      items: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
    });
    const fixture = createFixture();
    await waitForLoad(fixture);
    expect(fixture.nativeElement.textContent).toContain('Nada por aquí todavía');
    expect(fixture.nativeElement.textContent).toContain(
      '0 objetos cerca de ti · radio 50 km',
    );
  });

  it('shows error banner on initial load failure', async () => {
    itemsGet.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
    );
    const fixture = createFixture();
    await waitForLoad(fixture);
    expect(fixture.componentInstance.items().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudieron cargar los objetos.',
    );
  });

  it('retry reloads after initial load failure', async () => {
    itemsGet
      .mockRejectedValueOnce(
        new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
      )
      .mockResolvedValueOnce(page1);
    const fixture = createFixture();
    await waitForLoad(fixture);
    await fixture.componentInstance.retry();
    await waitForLoad(fixture);
    expect(itemsGet).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.items().length).toBe(1);
    expect(fixture.componentInstance.errorKey()).toBeNull();
  });

  it('renders degraded item badge in the grid', async () => {
    itemsGet.mockResolvedValueOnce({
      items: [
        {
          ...page1.items[0],
          degradedAt: '2026-04-01T10:00:00.000Z',
        },
      ],
      pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    const fixture = createFixture();
    await waitForLoad(fixture);
    expect(fixture.nativeElement.querySelector('.feed-card--degraded')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('lleva tiempo aquí');
  });

  it('shows error banner on load failure without clearing items', async () => {
    itemsGet.mockResolvedValueOnce(page1);
    const fixture = createFixture();
    await waitForLoad(fixture);

    itemsGet.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
    );
    await fixture.componentInstance.loadMore();
    for (let i = 0; i < 50 && fixture.componentInstance.loadingMore(); i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
    }
    fixture.detectChanges();

    expect(fixture.componentInstance.items().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain(
      'No se pudieron cargar los objetos.',
    );
  });

  it('filters by category and combines with condition and search', async () => {
    itemsGet.mockResolvedValueOnce({
      items: [
        { ...page1.items[0], condition: 'good' } as ItemSummary,
        {
          ...page2.items[0],
          condition: 'good',
          title: 'Taladro Bosch',
          id: '33333333-3333-3333-3333-333333333333',
        } as ItemSummary,
        {
          ...page2.items[0],
          condition: 'fair',
          title: 'Mesa de comedor',
          id: '44444444-4444-4444-4444-444444444444',
        } as ItemSummary,
      ],
      pagination: { total: 3, page: 1, limit: 20, totalPages: 1 },
    });
    const fixture = createFixture();
    await waitForLoad(fixture);

    const component = fixture.componentInstance;
    const enriched = component.items().map((item, idx) => {
      if (idx === 0) {
        return { ...item, category: 'other' };
      }
      if (idx === 1) {
        return { ...item, category: 'tools' };
      }
      return { ...item, category: 'furniture' };
    }) as ItemSummary[];
    component.items.set(enriched);
    component.setCategoryFilter('tools');
    component.setConditionFilter('good');
    component.search.set('taladro');
    fixture.detectChanges();

    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0]?.title).toBe('Taladro Bosch');
  });

  it('renders category filter chips with aria-pressed state', async () => {
    itemsGet.mockResolvedValueOnce(page1);
    const fixture = createFixture();
    await waitForLoad(fixture);

    const component = fixture.componentInstance;
    component.setCategoryFilter('tools');
    fixture.detectChanges();

    const chips = Array.from(
      fixture.nativeElement.querySelectorAll('.explorar__cat-row .explorar__cat-chip'),
    ) as HTMLButtonElement[];
    const toolsChip = chips.find((chip) =>
      chip.textContent?.trim().includes('Herramientas'),
    );
    const allChip = chips.find((chip) =>
      chip.textContent?.trim().includes('Todas las categorías'),
    );

    expect(toolsChip?.getAttribute('aria-pressed')).toBe('true');
    expect(allChip?.getAttribute('aria-pressed')).toBe('false');
  });

  it('does not handle 401 in the feature (interceptor responsibility)', async () => {
    itemsGet.mockRejectedValueOnce(
      new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }),
    );
    const fixture = createFixture();
    await waitForLoad(fixture);
    expect(fixture.componentInstance.errorKey()).toBeNull();
    expect(fixture.componentInstance.items().length).toBe(0);
  });

  it('reapplies explorar SEO when the detail modal closes', async () => {
    const explorarSeoApply = vi.fn();
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        ExplorarComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([{ path: 'explorar', component: ExplorarComponent }]),
        { provide: ItemsService, useValue: { itemsGet } },
        { provide: ExplorarSeoService, useValue: { apply: explorarSeoApply } },
      ],
    }).compileComponents();
    itemsGet.mockResolvedValueOnce(page1);
    const fixture = TestBed.createComponent(ExplorarComponent);
    fixture.detectChanges();
    await waitForLoad(fixture);
    expect(explorarSeoApply).toHaveBeenCalledTimes(1);

    fixture.componentInstance.openDetail(page1.items[0].id);
    fixture.detectChanges();
    fixture.componentInstance.closeDetail();
    fixture.detectChanges();

    expect(explorarSeoApply).toHaveBeenCalledTimes(2);
  });
});
