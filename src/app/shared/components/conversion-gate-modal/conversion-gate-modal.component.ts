import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

export type ConversionGateTrigger = 'request_item' | 'publish_item' | 'view_profile';

@Component({
  selector: 'app-conversion-gate-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './conversion-gate-modal.component.html',
  styleUrl: './conversion-gate-modal.component.scss',
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class ConversionGateModalComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private previouslyFocused: HTMLElement | null = null;

  readonly trigger = input.required<ConversionGateTrigger>();
  readonly returnUrl = input<string | null>(null);
  readonly closed = output<void>();

  readonly registerBtn = viewChild<ElementRef<HTMLElement>>('registerBtn');

  readonly benefits: ['benefit_1', 'benefit_2', 'benefit_3'] = [
    'benefit_1',
    'benefit_2',
    'benefit_3',
  ];

  get returnQueryParams(): Record<string, string> | undefined {
    const url = this.returnUrl();
    return url ? { returnUrl: url } : undefined;
  }

  ngAfterViewInit(): void {
    this.previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => {
      this.registerBtn()?.nativeElement.focus();
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closed.emit();
      return;
    }
    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  private trapFocus(event: KeyboardEvent): void {
    const focusables = this.getFocusableElements();
    if (!focusables.length) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const panel = this.elementRef.nativeElement.querySelector('.conv-modal__panel') as HTMLElement | null;
    if (!panel) {
      return [];
    }
    const selectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    return Array.from(panel.querySelectorAll<HTMLElement>(selectors.join(','))).filter(
      (el) => !el.hasAttribute('disabled') && el.tabIndex !== -1,
    );
  }
}
