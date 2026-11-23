import { describe, expect, it, vi } from 'vitest';
import { scrollToHowItWorksSection } from './scroll-to-how-it-works';

describe('scrollToHowItWorksSection', () => {
  it('scrolls when #como-funciona exists on the page', () => {
    const target = document.createElement('section');
    target.id = 'como-funciona';
    document.body.append(target);

    const scrollTo = vi.fn();
    const documentStub = {
      getElementById: (id: string) => (id === 'como-funciona' ? target : null),
      defaultView: {
        scrollY: 0,
        scrollTo,
      },
    } as unknown as Document;

    target.getBoundingClientRect = () =>
      ({ top: 100 }) as DOMRect;

    scrollToHowItWorksSection(documentStub);

    expect(scrollTo).toHaveBeenCalledWith({ top: 28, behavior: 'smooth' });

    target.remove();
  });

  it('navigates to home fragment when anchor is missing', () => {
    const navigate = vi.fn().mockResolvedValue(true);
    const router = { navigate } as never;

    scrollToHowItWorksSection(document, router);

    expect(navigate).toHaveBeenCalledWith(['/'], { fragment: 'como-funciona' });
  });
});
