import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { LandingFooterComponent } from '../../shared/components/landing-footer/landing-footer.component';
import { LandingNavComponent } from '../../shared/components/landing-nav/landing-nav.component';
import { SiteFooterComponent } from '../../shared/components/site-footer/site-footer.component';
import {
  COOKIE_TOGGLE_PREVIEW,
  COOKIE_TYPE_CARDS,
  COOKIES_CONTACT_ROWS,
  COOKIES_SECTIONS,
  COOKIES_TOC,
  PRIVACY_CONTROLLER_ROWS,
  PRIVACY_CONTACT_ROWS,
  PRIVACY_SECTIONS,
  PRIVACY_TOC,
} from './legal-pages.config';

@Component({
  selector: 'app-legal-pages',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, SiteFooterComponent, LandingFooterComponent, LandingNavComponent, RouterLink],
  templateUrl: './legal-pages.component.html',
  styleUrl: './legal-pages.component.scss',
})
export class LegalPagesComponent {
  private readonly route = inject(ActivatedRoute);

  readonly pageType = computed<'privacy' | 'cookies'>(() =>
    this.route.snapshot.data['page'] === 'cookies' ? 'cookies' : 'privacy',
  );

  readonly publicMode = computed(() => this.route.snapshot.data['publicMode'] === true);

  readonly privacyToc = PRIVACY_TOC;
  readonly cookiesToc = COOKIES_TOC;
  readonly privacySections = PRIVACY_SECTIONS;
  readonly cookiesSections = COOKIES_SECTIONS;
  readonly privacyControllerRows = PRIVACY_CONTROLLER_ROWS;
  readonly privacyContactRows = PRIVACY_CONTACT_ROWS;
  readonly cookiesContactRows = COOKIES_CONTACT_ROWS;
  readonly cookieTypeCards = COOKIE_TYPE_CARDS;
  readonly cookieTogglePreview = COOKIE_TOGGLE_PREVIEW;

  readonly privacyRightsCards = [
    'legal.privacy.sections.rights.cards.0',
    'legal.privacy.sections.rights.cards.1',
    'legal.privacy.sections.rights.cards.2',
    'legal.privacy.sections.rights.cards.3',
    'legal.privacy.sections.rights.cards.4',
    'legal.privacy.sections.rights.cards.5',
  ] as const;

  readonly privacyMinorsParagraphs = [
    'legal.privacy.sections.minors.paragraphs.0',
    'legal.privacy.sections.minors.paragraphs.1',
  ] as const;

  readonly privacyChangesParagraphs = [
    'legal.privacy.sections.changes.paragraphs.0',
    'legal.privacy.sections.changes.paragraphs.1',
  ] as const;


  readonly cookiesChangesParagraphs = ['legal.cookies.sections.changes.paragraphs.0'] as const;

  readonly privacyDataRows = [0, 1, 2, 3, 4, 5] as const;
  readonly privacyPurposeRows = [0, 1, 2, 3, 4, 5] as const;
  readonly privacyRetentionRows = [0, 1, 2, 3, 4] as const;
  readonly privacyRecipientsRows = [0, 1] as const;
  readonly cookiesTableRows = [0, 1, 2, 3, 4] as const;
  readonly cookiesBrowserRows = [0, 1, 2, 3] as const;
}
