import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { CandidateRowComponent } from './candidate-row.component';

const esJson = {
  profile: {
    public: { title: 'Perfil de usuario' },
  },
  items: {
    explore: { distance_km: '{{km}} km' },
    my_objects: {
      best_candidate: 'Mejor candidato',
      select: 'Seleccionar',
      select_candidate: 'Seleccionar candidato en posición {{rank}}',
      select_disabled_paused: 'Selección no disponible: solicitudes pausadas',
      days_today: 'hoy',
      days_yesterday: 'ayer',
      days_ago: 'hace {{days}}d',
    },
  },
};

function makeCandidate(
  overrides: Partial<RankedCandidate> = {},
): RankedCandidate {
  return {
    requestId: 'req-1',
    userId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    firstName: 'Ana',
    lastName: 'García',
    reputationScore: 85,
    distanceMeters: 1200,
    locationName: null,
    requestDate: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    ...overrides,
  };
}

describe('CandidateRowComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CandidateRowComponent,
        TranslocoTestingModule.forRoot({
          langs: { es: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es'] },
        }),
      ],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows best candidate badge and primary select for rank 1', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    fixture.componentRef.setInput('candidate', makeCandidate());
    fixture.componentRef.setInput('rank', 1);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Mejor candidato');
    expect(el.textContent).toContain('Seleccionar');
    expect(el.querySelector('.btn--primary')).toBeTruthy();
  });

  it('shows negative reputation score (NFR-F7)', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    fixture.componentRef.setInput(
      'candidate',
      makeCandidate({ reputationScore: -5 }),
    );
    fixture.componentRef.setInput('rank', 2);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('-5');
    expect(fixture.nativeElement.textContent).not.toContain('+0');
  });

  it('emits select with candidate on button click', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    const candidate = makeCandidate();
    fixture.componentRef.setInput('candidate', candidate);
    fixture.componentRef.setInput('rank', 2);
    fixture.detectChanges();

    const handler = vi.fn();
    fixture.componentInstance.select.subscribe(handler);

    const btn = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    btn.click();

    expect(handler).toHaveBeenCalledWith(candidate);
  });

  it('does not emit select when selectDisabled is true', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    fixture.componentRef.setInput('candidate', makeCandidate());
    fixture.componentRef.setInput('rank', 1);
    fixture.componentRef.setInput('selectDisabled', true);
    fixture.detectChanges();

    const handler = vi.fn();
    fixture.componentInstance.select.subscribe(handler);

    const btn = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    btn.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('renders shared user avatar in profile link', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    fixture.componentRef.setInput('candidate', makeCandidate());
    fixture.componentRef.setInput('rank', 2);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a.candidate-row__profile-link',
    ) as HTMLAnchorElement;
    const avatar = link?.querySelector('app-user-avatar');
    expect(avatar).toBeTruthy();
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
  });

  it('avatar shows proper initials from firstName/lastName', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    fixture.componentRef.setInput('candidate', makeCandidate({ firstName: 'Carlos', lastName: 'López' }));
    fixture.componentRef.setInput('rank', 1);
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('app-user-avatar');
    expect(avatar).toBeTruthy();
    const initialsEl = avatar?.querySelector('.user-avatar__initials');
    expect(initialsEl?.textContent?.trim()).toBe('CL');
  });

  it('links profile block to /users/:id without navigating on select (AC 14)', () => {
    const fixture = TestBed.createComponent(CandidateRowComponent);
    const candidate = makeCandidate();
    fixture.componentRef.setInput('candidate', candidate);
    fixture.componentRef.setInput('rank', 2);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a.candidate-row__profile-link',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toContain(
      `/users/${candidate.userId}`,
    );

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(link.contains(btn)).toBe(false);
  });
});
