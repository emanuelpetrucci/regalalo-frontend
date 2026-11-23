import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { AppLocale } from '../i18n/locale.service';
import { CookieConsentService } from '../services/cookie-consent.service';
import { absoluteSiteUrl, resolveSiteBaseUrl } from './resolve-site-url';
import { SeoService } from './seo.service';

interface FaqItem {
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class LandingSeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly transloco = inject(TranslocoService);
  private readonly seo = inject(SeoService);
  private readonly document = inject(DOCUMENT);
  private readonly cookieConsent = inject(CookieConsentService);
  private readonly siteBaseUrl = resolveSiteBaseUrl();

  private analyticsLoaded = false;
  private analyticsInitInProgress = false;

  apply(locale: AppLocale): void {
    this.document.documentElement.lang = locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';
    const lang = locale;
    const pageTitle =
      this.transloco.translate('landing.meta.title', {}, lang) ?? '';
    const description =
      this.transloco.translate('landing.meta.description', {}, lang) ?? '';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.seo.applyRobotsForUrl(this.document.location?.pathname ?? '/');

    const canonicalPath = this.canonicalPathForLocale(lang);
    const canonicalUrl = this.absoluteUrl(canonicalPath);
    this.setCanonical(canonicalUrl);
    this.setOpenGraph(pageTitle, description, canonicalUrl, lang);
    this.setHreflang();
    this.setStructuredData(pageTitle, description, canonicalUrl, lang);
    this.initAnalytics();
  }

  initAnalyticsIfNeeded(): void {
    this.initAnalytics();
  }

  private canonicalPathForLocale(locale: AppLocale): string {
    if (locale === 'en') return '/en';
    if (locale === 'ca') return '/ca';
    return '/';
  }

  private absoluteUrl(path: string): string {
    return absoluteSiteUrl(path, this.siteBaseUrl);
  }

  private ogImageUrl(): string {
    const path = environment.ogImagePath.startsWith('/')
      ? environment.ogImagePath
      : `/${environment.ogImagePath}`;
    return absoluteSiteUrl(path, this.siteBaseUrl);
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

  private setOpenGraph(
    pageTitle: string,
    description: string,
    url: string,
    locale: AppLocale,
  ): void {
    const ogLocale =
      locale === 'ca' ? 'ca_ES' : locale === 'en' ? 'en_US' : 'es_ES';
    const imageUrl = this.ogImageUrl();
    const tags: Array<{ property?: string; name?: string; content: string }> = [
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:locale', content: ogLocale },
      { property: 'og:site_name', content: 'Regálalo' },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width',  content: '1200' },
      { property: 'og:image:height', content: '630'  },
      { property: 'og:image:type',   content: 'image/png' },
      { property: 'og:image:alt', content: pageTitle },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
    ];
    tags.forEach(({ property, name, content }) => {
      if (property) {
        this.meta.updateTag({ property, content });
      } else if (name) {
        this.meta.updateTag({ name, content });
      }
    });
  }

  private setHreflang(): void {
    const head = this.document.head;
    const hreflangs = [
      { lang: 'es', href: this.absoluteUrl('/') },
      { lang: 'ca', href: this.absoluteUrl('/ca') },
      { lang: 'en', href: this.absoluteUrl('/en') },
      { lang: 'x-default', href: this.absoluteUrl('/') },
    ];
    hreflangs.forEach(({ lang, href }) => {
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

  private setStructuredData(
    pageTitle: string,
    description: string,
    url: string,
    locale: AppLocale,
  ): void {
    const siteUrl = this.siteBaseUrl;
    const inLanguage =
      locale === 'ca' ? 'ca' : locale === 'en' ? 'en' : 'es';
    const imageUrl = this.ogImageUrl();

    this.seo.setJsonLd('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Regálalo',
      url: `${siteUrl}/`,
      description,
      inLanguage,
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/explorar?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    });

    this.seo.setJsonLd('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Regálalo',
      alternateName: 'Regalalo',
      url: `${siteUrl}/`,
      description,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg` },
      foundingDate: '2026',
      foundingLocation: { '@type': 'Country', name: 'Spain' },
      areaServed: { '@type': 'Country', name: 'Spain' },
      inLanguage: ['es', 'ca', 'en'],
    });

    const faq = this.buildFaq(locale);
    if (faq.length > 0) {
      this.seo.setJsonLd('faq', {
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

    this.seo.setJsonLd('webpage', {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: pageTitle,
      description,
      url,
      inLanguage,
      primaryImageOfPage: imageUrl,
      isPartOf: { '@type': 'WebSite', name: 'Regálalo', url: `${siteUrl}/` },
    });

    this.seo.setJsonLd('app', {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Regálalo',
      url: `${siteUrl}/`,
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Web',
      description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
      inLanguage: ['es', 'ca', 'en'],
      featureList: ['Donar objetos', 'Solicitar objetos', 'Sistema de reputación comunitaria', 'Entregas peer-to-peer'],
      softwareVersion: '1.0',
      screenshot: `${siteUrl}/og-image.png`,
    });
  }

  private buildFaq(locale: AppLocale): FaqItem[] {
    const t = (key: string) =>
      this.transloco.translate(key, {}, locale) as string;
    const items: FaqItem[] = [
      { question: t('landing.seo.faq.q1'), answer: t('landing.seo.faq.a1') },
      { question: t('landing.seo.faq.q2'), answer: t('landing.seo.faq.a2') },
      { question: t('landing.seo.faq.q3'), answer: t('landing.seo.faq.a3') },
      { question: t('landing.seo.faq.q4'), answer: t('landing.seo.faq.a4') },
      { question: t('landing.seo.faq.q5'), answer: t('landing.seo.faq.a5') },
      { question: t('landing.seo.faq.q6'), answer: t('landing.seo.faq.a6') },
      { question: t('landing.seo.faq.q7'), answer: t('landing.seo.faq.a7') },
      { question: t('landing.seo.faq.q8'), answer: t('landing.seo.faq.a8') },
    ];
    return items.filter((item) => item.question && item.answer);
  }

  private initAnalytics(): void {
    const id = environment.googleAnalyticsId?.trim();
    if (
      !id ||
      this.analyticsLoaded ||
      this.analyticsInitInProgress ||
      !this.cookieConsent.canRun('analytics')
    ) return;

    const win = this.document.defaultView as
      | (Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void })
      | null;
    if (!win) return;

    const configureAnalytics = (): void => {
      if (this.analyticsLoaded || !this.cookieConsent.canRun('analytics')) {
        this.analyticsInitInProgress = false;
        return;
      }

      win.dataLayer = win.dataLayer ?? [];
      if (!win.gtag) {
        const dataLayer = win.dataLayer;
        win.gtag = function (..._args: unknown[]): void {
          dataLayer.push(arguments);
        };
      }

      win.gtag('js', new Date());
      win.gtag('config', id, { send_page_view: true });
      this.analyticsLoaded = true;
      this.analyticsInitInProgress = false;
    };

    const existingScript = this.document.getElementById('ga-gtag') as HTMLScriptElement | null;
    if (existingScript) {
      if (win.gtag) {
        configureAnalytics();
      } else {
        this.analyticsInitInProgress = true;
        existingScript.addEventListener('load', configureAnalytics, { once: true });
        existingScript.addEventListener(
          'error',
          () => {
            this.analyticsInitInProgress = false;
          },
          { once: true },
        );
      }
      return;
    }

    const script = this.document.createElement('script');
    script.id = 'ga-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    this.analyticsInitInProgress = true;
    script.addEventListener('load', configureAnalytics, { once: true });
    script.addEventListener(
      'error',
      () => {
        this.analyticsInitInProgress = false;
      },
      { once: true },
    );
    this.document.head.appendChild(script);
  }
}
