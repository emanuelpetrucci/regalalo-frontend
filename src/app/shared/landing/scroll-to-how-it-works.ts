import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

/** Offset for sticky nav when scrolling to `#como-funciona`. */
const SCROLL_OFFSET_PX = 72;

export function scrollToHowItWorksSection(
  document: Document,
  router?: Router,
): void {
  const win = document.defaultView;
  const target = document.getElementById('como-funciona');
  if (target && win) {
    const top = target.getBoundingClientRect().top + win.scrollY - SCROLL_OFFSET_PX;
    win.scrollTo({ top, behavior: 'smooth' });
    return;
  }
  if (router) {
    void router.navigate(['/'], { fragment: 'como-funciona' });
  }
}

/** Injectable helper for components that already use `inject()`. */
export function useScrollToHowItWorks(): (event: Event) => void {
  const document = inject(DOCUMENT);
  const router = inject(Router);
  return (event: Event) => {
    event.preventDefault();
    scrollToHowItWorksSection(document, router);
  };
}
