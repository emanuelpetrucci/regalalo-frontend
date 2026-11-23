import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import type { GetItemResponse } from '../api/generated/models/get-item-response';
import { LandingSeoService } from './landing-seo.service';
import { itemPublicUrl } from '../utils/item-public-path.util';
import { absoluteSiteUrl, resolveSiteBaseUrl } from './resolve-site-url';
import {
  inferOgImageMimeType,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  truncateSeoDescription,
  TWITTER_SITE_HANDLE,
} from './seo-meta.util';
import { SeoService } from './seo.service';

const CONDITION_SCHEMA: Record<GetItemResponse['condition'], string> = {
  new: 'https://schema.org/NewCondition',
  like_new: 'https://schema.org/LikeNewCondition',
  good: 'https://schema.org/UsedCondition',
  fair: 'https://schema.org/UsedCondition',
};

@Injectable({ providedIn: 'root' })
export class ItemSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly transloco = inject(TranslocoService);
  private readonly seo = inject(SeoService);
  private readonly landingSeo = inject(LandingSeoService);
  private readonly document = inject(DOCUMENT);
  private readonly siteBaseUrl = resolveSiteBaseUrl();

  apply(item: GetItemResponse): void {
    const truncatedDesc = truncateSeoDescription(item.description);
    const firstImage = item.images[0] ?? null;
    const url = itemPublicUrl(this.siteBaseUrl, item);
    const suffix = this.t('items.detail.meta.title_suffix', 'es');
    const pageTitle = `${item.title} ${suffix}`;
    const isNoIndex = item.status === 'completed' || item.status === 'cancelled';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: truncatedDesc });
    this.meta.updateTag({ name: 'robots', content: isNoIndex ? 'noindex, follow' : 'index, follow' });

    this.setCanonical(url);
    this.setOpenGraph(pageTitle, truncatedDesc, url, item.title, firstImage);
    this.setStructuredData(item, pageTitle, truncatedDesc, url, isNoIndex);
    this.landingSeo.initAnalyticsIfNeeded();
  }

  clear(): void {
    this.title.setTitle('Objeto · Regálalo');
    this.meta.updateTag({
      name: 'description',
      content:
        'Detalle del objeto gratuito. Solicítalo sin dinero y recógelo cerca de ti. Donación comunitaria.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Objeto · Regálalo' });
    this.meta.updateTag({ property: 'og:description', content: 'Objeto gratuito. Donación comunitaria sin dinero.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:image:width"');
    this.meta.removeTag('property="og:image:height"');
    this.meta.removeTag('property="og:image:alt"');
    this.meta.removeTag('property="og:image:type"');
    this.meta.removeTag('property="og:locale"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');
    this.meta.removeTag('name="twitter:image:alt"');
    this.meta.removeTag('name="twitter:site"');
    this.removeCanonical();
    this.seo.removeJsonLd('item-product');
    this.seo.removeJsonLd('item-breadcrumb');
  }

  private t(key: string, locale: string): string {
    return this.transloco.translate(key, {}, locale) as string;
  }

  private setCanonical(href: string): void {
    const head = this.document.head;
    let link = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      head.appendChild(link);
    }
    link.href = href;
  }

  private removeCanonical(): void {
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
  }

  private setOpenGraph(
    pageTitle: string,
    description: string,
    url: string,
    imageAlt: string,
    image: string | null,
  ): void {
    const tags: Array<{ property?: string; name?: string; content: string }> = [
      { property: 'og:type', content: 'product' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: 'es_ES' },
      { property: 'og:site_name', content: 'Regálalo' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: TWITTER_SITE_HANDLE },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description },
    ];
    tags.forEach(({ property, name, content }) => {
      if (property) {
        this.meta.updateTag({ property, content });
      } else if (name) {
        this.meta.updateTag({ name, content });
      }
    });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
      this.meta.updateTag({ property: 'og:image:width', content: OG_IMAGE_WIDTH });
      this.meta.updateTag({ property: 'og:image:height', content: OG_IMAGE_HEIGHT });
      this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
      this.meta.updateTag({ property: 'og:image:type', content: inferOgImageMimeType(image) });
      this.meta.updateTag({ name: 'twitter:image', content: image });
      this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });
    } else {
      this.meta.removeTag('property="og:image"');
      this.meta.removeTag('property="og:image:width"');
      this.meta.removeTag('property="og:image:height"');
      this.meta.removeTag('property="og:image:alt"');
      this.meta.removeTag('property="og:image:type"');
      this.meta.removeTag('name="twitter:image"');
      this.meta.removeTag('name="twitter:image:alt"');
    }
  }

  private setStructuredData(
    item: GetItemResponse,
    pageTitle: string,
    description: string,
    url: string,
    isNoIndex: boolean,
  ): void {
    const siteUrl = this.siteBaseUrl;
    const locale = 'es';
    const availability = isNoIndex
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

    const productData: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': url,
      name: item.title,
      description,
      url,
      itemCondition: CONDITION_SCHEMA[item.condition],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        availability,
        url,
        seller: {
          '@type': 'Organization',
          name: 'Regálalo',
          url: `${siteUrl}/`,
        },
      },
    };
    if (item.images.length > 0) {
      productData['image'] = item.images;
    }

    this.seo.setJsonLd('item-product', productData);

    this.seo.setJsonLd('item-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: this.t('items.detail.seo.breadcrumb_home', locale),
          item: `${siteUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: this.t('items.detail.seo.breadcrumb_explore', locale),
          item: absoluteSiteUrl('/explorar', siteUrl),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: pageTitle,
          item: url,
        },
      ],
    });
  }
}
