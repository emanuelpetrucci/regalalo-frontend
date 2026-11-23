import { TestBed } from '@angular/core/testing';
import { AnalyticsEventsService } from './analytics-events.service';
import { CookieConsentService } from './cookie-consent.service';

describe('AnalyticsEventsService', () => {
  let allowed: boolean;
  let gtag: ReturnType<typeof vi.fn>;
  let service: AnalyticsEventsService;

  beforeEach(() => {
    allowed = true;
    gtag = vi.fn();
    (window as unknown as { gtag?: unknown }).gtag = gtag;
    TestBed.configureTestingModule({
      providers: [{ provide: CookieConsentService, useValue: { canRun: () => allowed } }],
    });
    service = TestBed.inject(AnalyticsEventsService);
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it('sends sign_up with consent', () => {
    service.trackSignUp();
    expect(gtag).toHaveBeenCalledWith('event', 'sign_up', { method: 'email' });
  });

  it('sends publicacion_articulo with item_id', () => {
    service.trackItemPublished('abc');
    expect(gtag).toHaveBeenCalledWith('event', 'publicacion_articulo', { item_id: 'abc' });
  });

  it('does nothing without analytics consent', () => {
    allowed = false;
    service.trackSignUp();
    expect(gtag).not.toHaveBeenCalled();
  });

  it('does nothing when gtag is not loaded', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    expect(() => service.trackSignUp()).not.toThrow();
  });
});
