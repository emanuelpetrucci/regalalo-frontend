import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { GetItemResponse } from '../api/generated/models/get-item-response';
import { environment } from '../../../environments/environment';
import { ItemSeoService } from './item-seo.service';
import { SeoService } from './seo.service';
import { TWITTER_SITE_HANDLE } from './seo-meta.util';

function buildItem(overrides: Partial<GetItemResponse> = {}): GetItemResponse {
  return {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    slug: 'mesa-de-madera',
    title: 'Mesa',
    description: 'Descripción corta del objeto.',
    condition: 'good',
    category: 'furniture',
    weightRange: '1to5',
    status: 'active',
    requestsPaused: false,
    degradedAt: null,
    distanceMeters: 1000,
    images: [],
    locationName: null,
    createdAt: '2026-05-01T10:00:00.000Z',
    donor: {
      id: 'donor',
      firstName: 'Ana',
      lastName: 'López',
      avatarUrl: null,
      reputationScore: 10,
    },
    ...overrides,
  };
}

describe('ItemSeoService', () => {
  afterEach(() => {
    TestBed.inject(ItemSeoService).clear();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: { items: { detail: { meta: { title_suffix: '· Regálalo' } } } } },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [ItemSeoService, SeoService, Title, Meta],
    }).compileComponents();
  });

  it('sets canonical URL with item slug', () => {
    const item = buildItem();
    TestBed.inject(ItemSeoService).apply(item);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    expect(canonical?.href).toBe(`${environment.siteUrl}/items/mesa-de-madera`);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl?.getAttribute('content')).toBe(`${environment.siteUrl}/items/mesa-de-madera`);
  });

  it('noindexes completed and cancelled items', () => {
    TestBed.inject(ItemSeoService).apply(buildItem({ status: 'completed' }));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
    TestBed.inject(ItemSeoService).apply(buildItem({ status: 'cancelled' }));
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
  });

  it('uses the item id when the slug is empty', () => {
    const item = buildItem({ slug: '' });
    TestBed.inject(ItemSeoService).apply(item);
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    expect(canonical?.href).toBe(`${environment.siteUrl}/items/${item.id}`);
  });

  it('sets extended OG image tags and twitter:site when an image exists', () => {
    const item = buildItem({
      title: 'Silla',
      images: ['https://cdn.example/item.webp', 'https://cdn.example/item-2.jpg'],
    });
    TestBed.inject(ItemSeoService).apply(item);

    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('product');
    expect(document.querySelector('meta[property="og:image:width"]')?.getAttribute('content')).toBe('1200');
    expect(document.querySelector('meta[property="og:image:height"]')?.getAttribute('content')).toBe('630');
    expect(document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content')).toBe('Silla');
    expect(document.querySelector('meta[property="og:image:type"]')?.getAttribute('content')).toBe('image/webp');
    expect(document.querySelector('meta[name="twitter:image:alt"]')?.getAttribute('content')).toBe('Silla');
    expect(document.querySelector('meta[name="twitter:site"]')?.getAttribute('content')).toBe(
      TWITTER_SITE_HANDLE,
    );
  });

  it('serializes Product JSON-LD with @id, seller and all images', () => {
    const item = buildItem({
      images: ['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'],
    });
    TestBed.inject(ItemSeoService).apply(item);
    const script = document.querySelector('script[data-seo-jsonld="item-product"]');
    const json = JSON.parse(script?.textContent ?? '{}') as Record<string, unknown>;
    const canonical = `${environment.siteUrl}/items/mesa-de-madera`;

    expect(json['@id']).toBe(canonical);
    expect(json['url']).toBe(canonical);
    expect(json['image']).toEqual(item.images);
    const offers = json['offers'] as Record<string, unknown>;
    const seller = offers['seller'] as Record<string, unknown>;
    expect(seller['@type']).toBe('Organization');
    expect(seller['name']).toBe('Regálalo');
    expect(seller['url']).toBe(`${environment.siteUrl}/`);
  });

  it('truncates meta description on word boundary with ellipsis', () => {
    const long =
      'Esta es una descripción muy larga que supera claramente el límite de ciento sesenta caracteres y debe cortarse en un espacio antes de añadir los puntos suspensivos finales.';
    TestBed.inject(ItemSeoService).apply(buildItem({ description: long }));
    const content = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(content.endsWith('…')).toBe(true);
    expect(content.length).toBeLessThanOrEqual(161);
  });
});
