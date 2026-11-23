import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ItemDonorRowComponent } from './item-donor-row.component';

const esJson = {
  items: {
    detail: {
      donor_label: 'Donante',
      reputation_good: 'Buen historial',
      reputation_fair: 'Historial regular',
      reputation_low: 'Historial bajo',
    },
  },
};

describe('ItemDonorRowComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ItemDonorRowComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows negative reputation score without truncating (AC 6)', () => {
    const fixture = TestBed.createComponent(ItemDonorRowComponent);
    fixture.componentRef.setInput('donor', {
      id: '11111111-1111-1111-1111-111111111111',
      firstName: 'Ana',
      lastName: 'García',
      avatarUrl: null,
      reputationScore: -10,
    });
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('-10');
    expect(el.textContent).not.toContain('+0');
  });

  it('links to public profile route (AC 13)', () => {
    const donorId = '11111111-1111-4111-8111-111111111111';
    const fixture = TestBed.createComponent(ItemDonorRowComponent);
    fixture.componentRef.setInput('donor', {
      id: donorId,
      firstName: 'Luis',
      lastName: 'Pérez',
      avatarUrl: null,
      reputationScore: 42,
    });
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a.donor-row',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain(`/users/${donorId}`);
  });
});
