import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { AppLocale } from '../i18n/locale.service';
import { absoluteSiteUrl, resolveSiteBaseUrl } from './resolve-site-url';
import { SeoService } from './seo.service';

interface FaqItem {
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class ReputationSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly transloco = inject(TranslocoService);
  private readonly seo = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly siteBaseUrl = resolveSiteBaseUrl();

  apply(locale: AppLocale): void {
    this.document.documentElement.lang = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';
    const localePath =
      locale === 'ca'
        ? '/ca/com-funciona/reputacio'
        : locale === 'en'
          ? '/en/how-it-works/reputation'
          : '/como-funciona/reputacion';
    const url = absoluteSiteUrl(localePath, this.siteBaseUrl);
    const pageTitle = this.t('reputation_guide.meta.title', locale);
    const description = this.t('reputation_guide.meta.description', locale);

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.setCanonical(url);
    this.setHreflang();
    this.setOpenGraph(pageTitle, description, url, locale);
    this.setStructuredData(pageTitle, description, url, locale);
  }

  private t(key: string, locale: AppLocale): string {
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

  private setHreflang(): void {
    const head = this.document.head;
    const base = this.siteBaseUrl;
    [
      { lang: 'es', href: `${base}/como-funciona/reputacion` },
      { lang: 'ca', href: `${base}/ca/com-funciona/reputacio` },
      { lang: 'en', href: `${base}/en/how-it-works/reputation` },
      { lang: 'x-default', href: `${base}/como-funciona/reputacion` },
    ].forEach(({ lang, href }) => {
      const existing = head.querySelector(`link[hreflang="${lang}"]`);
      if (existing) {
        existing.setAttribute('href', href);
      } else {
        const link = this.document.createElement('link');
        link.rel = 'alternate';
        link.setAttribute('hreflang', lang);
        link.href = href;
        head.appendChild(link);
      }
    });
  }

  private setOpenGraph(
    pageTitle: string,
    description: string,
    url: string,
    locale: AppLocale,
  ): void {
    const ogLocale = locale === 'ca' ? 'ca_ES' : locale === 'en' ? 'en_US' : 'es_ES';
    const tags: Array<{ property?: string; name?: string; content: string }> = [
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: ogLocale },
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

  private setStructuredData(
    pageTitle: string,
    description: string,
    url: string,
    locale: AppLocale,
  ): void {
    const siteUrl = this.siteBaseUrl;
    const inLanguage = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';

    this.seo.setJsonLd('reputation-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: this.t('reputation_guide.seo.breadcrumb_home', locale),
          item: `${siteUrl}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: this.t('reputation_guide.seo.breadcrumb_page', locale),
          item: url,
        },
      ],
    });

    this.seo.setJsonLd('reputation-webpage', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description,
      url,
      inLanguage,
      isPartOf: { '@type': 'WebSite', name: 'Regálalo', url: `${siteUrl}/` },
    });

    const faq = this.buildFaq(locale);
    if (faq.length > 0) {
      this.seo.setJsonLd('reputation-faq', {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }
  }

  private buildFaq(locale: AppLocale): FaqItem[] {
    const items: FaqItem[] = [
      { question: this.t('reputation_guide.seo.faq.q1', locale), answer: this.t('reputation_guide.seo.faq.a1', locale) },
      { question: this.t('reputation_guide.seo.faq.q2', locale), answer: this.t('reputation_guide.seo.faq.a2', locale) },
      { question: this.t('reputation_guide.seo.faq.q3', locale), answer: this.t('reputation_guide.seo.faq.a3', locale) },
    ];
    return items.filter((item) => item.question && item.answer);
  }
}
