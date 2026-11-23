import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { LandingSeoService } from './landing-seo.service';
import { absoluteSiteUrl, resolveSiteBaseUrl } from './resolve-site-url';
import { SeoService } from './seo.service';

@Injectable({ providedIn: 'root' })
export class ExplorarSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly transloco = inject(TranslocoService);
  private readonly seo = inject(SeoService);
  private readonly landingSeo = inject(LandingSeoService);
  private readonly document = inject(DOCUMENT);
  private readonly siteBaseUrl = resolveSiteBaseUrl();

  apply(): void {
    this.document.documentElement.lang = 'es';

    const pageTitle = this.t('items.explore.meta.title');
    const description = this.t('items.explore.meta.description');
    const url = absoluteSiteUrl('/explorar', this.siteBaseUrl);

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.setCanonical(url);
    this.setOpenGraph(pageTitle, description, url);
    this.setStructuredData(pageTitle, description, url);
    this.landingSeo.initAnalyticsIfNeeded();
  }

  clear(): void {
    this.title.setTitle('Explorar · Regálalo');
    this.meta.removeTag('name="description"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:type"');
    this.meta.removeTag('property="og:locale"');
    this.meta.removeTag('property="og:site_name"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.document.head.querySelector('link[rel="canonical"]')?.remove();
    this.seo.removeJsonLd('explorar-webpage');
    this.seo.removeJsonLd('explorar-breadcrumb');
  }

  private t(key: string): string {
    return this.transloco.translate(key, {}, 'es') as string;
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

  private setOpenGraph(pageTitle: string, description: string, url: string): void {
    const tags: Array<{ property?: string; name?: string; content: string }> = [
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: 'es_ES' },
      { property: 'og:site_name', content: 'Regálalo' },
      { name: 'twitter:card', content: 'summary' },
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
  }

  private setStructuredData(pageTitle: string, description: string, url: string): void {
    const siteUrl = this.siteBaseUrl;

    this.seo.setJsonLd('explorar-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: this.t('items.explore.seo.breadcrumb_home'),
          item: `${siteUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: this.t('items.explore.seo.breadcrumb_page'),
          item: url,
        },
      ],
    });

    this.seo.setJsonLd('explorar-webpage', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle,
      description,
      url,
      inLanguage: 'es',
      isPartOf: { '@type': 'WebSite', name: 'Regálalo', url: `${siteUrl}/` },
    });
  }
}
