import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isLandingPath } from './seo.constants';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  init(): void {
    this.applyRobotsForUrl(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.applyRobotsForUrl(e.urlAfterRedirects));
  }

  applyRobotsForUrl(url: string): void {
    const content = isLandingPath(url) ? 'index, follow' : 'noindex, nofollow';
    this.meta.updateTag({ name: 'robots', content });
  }

  setJsonLd(id: string, data: Record<string, unknown>): void {
    const head = this.document.head;
    const existing = head.querySelector(`script[data-seo-jsonld="${id}"]`);
    if (existing) {
      existing.textContent = JSON.stringify(data);
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo-jsonld', id);
    script.textContent = JSON.stringify(data);
    head.appendChild(script);
  }

  removeJsonLd(id: string): void {
    this.document.head
      .querySelector(`script[data-seo-jsonld="${id}"]`)
      ?.remove();
  }

  removeAllJsonLd(): void {
    this.document.head
      .querySelectorAll('script[data-seo-jsonld]')
      .forEach((el) => el.remove());
  }
}
