import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { ItemSummary } from '../../../core/api/generated/models/item-summary';
import { SessionService } from '../../../core/services/session.service';
import { ItemFeedCardComponent } from './item-feed-card.component';

const exploreI18n = {
  distance_km: '{{km}} km',
  degraded_badge: 'lleva tiempo aquí',
  image_alt: 'Foto de {{title}}',
};

const reportsI18n = {
  trigger: {
    menu_aria: 'Opciones del objeto',
    report_item: 'Reportar objeto',
    report_item_full: 'Reportar este objeto',
    report_user: 'Reportar este usuario',
  },
};

const esJson = {
  items: {
    explore: exploreI18n,
    publish: {
      condition_new: 'A estrenar',
      condition_like_new: 'Como nuevo',
      condition_good: 'Buen estado',
      condition_fair: 'Aceptable',
    },
  },
  reports: reportsI18n,
};

const baseItem: ItemSummary = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  slug: 'silla-de-madera',
  title: 'Silla de madera',
  condition: 'good',
  category: 'furniture',
  createdAt: '2026-05-01T10:00:00.000Z',
  degradedAt: null,
  distanceMeters: 5000,
  locationName: null,
  images: ['https://example.com/photo.jpg'],
};

function makeSessionMock(isLoggedIn: boolean, emailVerified?: boolean) {
  return {
    isLoggedIn: signal(isLoggedIn),
    user: signal(
      isLoggedIn ? { id: 'user-1', email: 'a@b.com', reputationScore: 0, emailVerified } : null,
    ).asReadonly(),
  };
}

describe('ItemFeedCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemFeedCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: makeSessionMock(false) },
      ],
    }).compileComponents();
  });

  function create(item: Partial<ItemSummary> = {}) {
    const fixture = TestBed.createComponent(ItemFeedCardComponent);
    fixture.componentRef.setInput('item', { ...baseItem, ...item });
    fixture.detectChanges();
    return fixture;
  }

  it('sets alt text from item title', () => {
    const fixture = create();
    const img = fixture.nativeElement.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Foto de Silla de madera');
  });

  it('shows degraded badge and class when degradedAt is set', () => {
    const fixture = create({
      degradedAt: '2026-04-01T10:00:00.000Z',
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.feed-card--degraded')).toBeTruthy();
    expect(el.textContent).toContain('lleva tiempo aquí');
  });

  it('formats distance in km', () => {
    const fixture = create({ distanceMeters: 12500 });
    expect(fixture.nativeElement.textContent).toContain('13 km');
  });

  it('links to the slug and emits it on click', () => {
    const fixture = create();
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement | null;
    expect(anchor?.getAttribute('href')).toContain('/items/silla-de-madera');
    const emitted: string[] = [];
    fixture.componentInstance.open.subscribe((value) => emitted.push(value));
    fixture.componentInstance.onCardClick();
    expect(emitted).toEqual(['silla-de-madera']);
  });

  it('falls back to id when the slug is empty', () => {
    const fixture = create({ slug: '' });
    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement | null;
    expect(anchor?.getAttribute('href')).toContain(`/items/${baseItem.id}`);
  });
});

describe('ItemFeedCardComponent — canReport / context menu', () => {
  function createWithSession(isLoggedIn: boolean, emailVerified?: boolean) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        ItemFeedCardComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [
        provideRouter([]),
        { provide: SessionService, useValue: makeSessionMock(isLoggedIn, emailVerified) },
      ],
    });
    const fixture = TestBed.createComponent(ItemFeedCardComponent);
    fixture.componentRef.setInput('item', baseItem);
    fixture.detectChanges();
    return fixture;
  }

  it('shows ctx-btn when logged in with emailVerified=true', () => {
    const fixture = createWithSession(true, true);
    expect(fixture.nativeElement.querySelector('.feed-card__ctx-btn')).toBeTruthy();
  });

  it('hides ctx-btn when not logged in', () => {
    const fixture = createWithSession(false, undefined);
    expect(fixture.nativeElement.querySelector('.feed-card__ctx-btn')).toBeNull();
  });

  it('hides ctx-btn when emailVerified is false', () => {
    const fixture = createWithSession(true, false);
    expect(fixture.nativeElement.querySelector('.feed-card__ctx-btn')).toBeNull();
  });

  it('menu click does not propagate to card (stopPropagation)', () => {
    const fixture = createWithSession(true, true);
    const cardClick = vi.fn();
    fixture.componentInstance.open.subscribe(cardClick);

    const ctxBtn = fixture.nativeElement.querySelector('.feed-card__ctx-btn') as HTMLElement;
    ctxBtn.click();
    fixture.detectChanges();

    expect(cardClick).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.feed-card__ctx-dropdown')).toBeTruthy();
  });
});
