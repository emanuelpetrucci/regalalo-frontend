import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

interface ShareNetwork {
  id: 'whatsapp' | 'facebook' | 'twitter';
  label: string;
  href: string;
  trackedUrl: string;
}

@Component({
  selector: 'app-share-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.scss',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class ShareDialogComponent implements AfterViewInit, OnDestroy {
  private readonly doc = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;

  readonly open = input(false);
  readonly title = input<string | null>(null);
  readonly url = input.required<string>();
  readonly gaContext = input('unknown');
  readonly dismissed = output<void>();

  readonly copied = signal(false);

  readonly shareText = computed(() => {
    const title = this.title()?.trim();
    if (!title) {
      return this.transloco.translate('items.share.default_text');
    }
    return this.transloco.translate('items.share.item_text', { title });
  });

  readonly networks = computed<ShareNetwork[]>(() => {
    const text = this.shareText();
    const whatsappUrl = this.buildTrackedUrl('whatsapp');
    const facebookUrl = this.buildTrackedUrl('facebook');
    const twitterUrl = this.buildTrackedUrl('twitter');
    return [
      {
        id: 'whatsapp',
        label: this.transloco.translate('items.share.network_whatsapp'),
        trackedUrl: whatsappUrl,
        href: `https://wa.me/?text=${encodeURIComponent(`${text}\n${whatsappUrl}`)}`,
      },
      {
        id: 'facebook',
        label: this.transloco.translate('items.share.network_facebook'),
        trackedUrl: facebookUrl,
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(facebookUrl)}&quote=${encodeURIComponent(text)}`,
      },
      {
        id: 'twitter',
        label: this.transloco.translate('items.share.network_twitter'),
        trackedUrl: twitterUrl,
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(twitterUrl)}`,
      },
    ];
  });

  readonly copyTrackedUrl = computed(() => this.buildTrackedUrl('copy_link'));
  // Compatibilidad temporal por si alguna plantilla compilada sigue usando trackedUrl().
  readonly trackedUrl = computed(() => this.copyTrackedUrl());

  ngAfterViewInit(): void {
    this.previouslyFocused = this.doc.activeElement instanceof HTMLElement ? this.doc.activeElement : null;
    queueMicrotask(() => this.focusFirstElement());
  }

  ngOnDestroy(): void {
    this.restoreFocus();
  }

  private buildTrackedUrl(source: string): string {
    const rawUrl = this.url();
    if (!rawUrl) {
      return rawUrl;
    }
    try {
      const parsed = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'https://regalalo.org');
      parsed.searchParams.set('utm_source', source);
      parsed.searchParams.set('utm_medium', 'social');
      parsed.searchParams.set('utm_campaign', 'item_share');
      parsed.searchParams.set('utm_content', this.gaContext());
      return parsed.toString();
    } catch {
      const separator = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${separator}utm_source=${encodeURIComponent(source)}&utm_medium=social&utm_campaign=item_share&utm_content=${encodeURIComponent(this.gaContext())}`;
    }
  }

  close(): void {
    this.dismissed.emit();
    this.restoreFocus();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dismissed.emit();
      this.restoreFocus();
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  async copyUrl(): Promise<void> {
    const shareUrl = this.copyTrackedUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 2200);
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusables = this.getFocusableElements();
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.doc.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirstElement(): void {
    const focusables = this.getFocusableElements();
    if (focusables.length) {
      focusables[0].focus();
      return;
    }
    this.panelRef()?.nativeElement.focus();
  }

  private restoreFocus(): void {
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.panelRef()?.nativeElement;
    if (!panel) {
      return [];
    }
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(panel.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
      (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
    );
  }
}
