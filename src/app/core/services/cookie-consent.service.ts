import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import {
  COOKIE_CONSENT_POLICY_VERSION,
  COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY,
} from '../config/cookie-consent.config';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface ConsentSnapshot {
  categories: Record<CookieCategory, boolean>;
  policyVersion: string;
  updatedAt: string;
  origin: 'initial' | 'restored' | 'updated' | 'policy-reset';
}

const SNAPSHOT_STORAGE_KEY = COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY;
const OPTIONAL_CATEGORIES: Array<Exclude<CookieCategory, 'necessary'>> = [
  'analytics',
  'marketing',
  'preferences',
];
const APP_LOCALES = ['es', 'ca', 'en'] as const;
type CookieConsentModule = typeof import('vanilla-cookieconsent');

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transloco = inject(TranslocoService);
  private readonly snapshotState = signal<ConsentSnapshot>(this.createDefaultSnapshot('initial'));
  private initPromise: Promise<void> | null = null;
  private cookieConsentLib: CookieConsentModule | null = null;
  private cookieConsentLibPromise: Promise<CookieConsentModule> | null = null;
  private initialized = false;
  private policyResetDuringInit = false;
  readonly snapshot = this.snapshotState.asReadonly();

  async init(): Promise<void> {
    if (!this.isBrowser()) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        this.cookieConsentLib = await this.loadLibrary();
        await this.preloadTranslations();
        const existingSnapshot = this.readSnapshot();
        this.policyResetDuringInit = false;
        this.resetIfPolicyVersionChanged(COOKIE_CONSENT_POLICY_VERSION);
        await this.cookieConsentLib.run({
          autoShow: true,
          disablePageInteraction: false,
          guiOptions: {
            consentModal: {
              layout: 'box inline',
              position: 'bottom right',
              equalWeightButtons: true,
            },
            preferencesModal: {
              layout: 'box',
              equalWeightButtons: true,
            },
          },
          categories: {
            necessary: { enabled: true, readOnly: true },
            analytics: { enabled: false },
            marketing: { enabled: false },
            preferences: { enabled: false },
          },
          language: {
            default: this.resolveActiveLocale(),
            autoDetect: 'browser',
            translations: this.buildTranslations(),
          },
          onFirstConsent: () => this.syncSnapshotFromLibrary('updated'),
          onConsent: () => this.syncSnapshotFromLibrary('updated'),
          onChange: () => this.syncSnapshotFromLibrary('updated'),
        });

        const restoredSnapshot = this.policyResetDuringInit ? null : existingSnapshot;
        this.syncSnapshotFromLibrary(restoredSnapshot ? 'restored' : 'updated', restoredSnapshot);
        this.initialized = true;
      } catch {
        this.initialized = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  acceptAll(): void {
    this.runMutation(() => {
      this.cookieConsentLib?.acceptCategory([...OPTIONAL_CATEGORIES]);
    });
  }

  rejectNonEssential(): void {
    this.runMutation(() => {
      this.cookieConsentLib?.acceptCategory('necessary', OPTIONAL_CATEGORIES);
    });
  }

  openPreferences(): void {
    this.runMutation(() => {
      this.cookieConsentLib?.showPreferences();
    });
  }

  setPreferences(partialCategories: Partial<Record<CookieCategory, boolean>>): void {
    this.runMutation(() => {
      const accepted = OPTIONAL_CATEGORIES.filter((category) => partialCategories[category] === true);
      this.cookieConsentLib?.acceptCategory('necessary', OPTIONAL_CATEGORIES);
      if (accepted.length) {
        this.cookieConsentLib?.acceptCategory(accepted);
      }
    });
  }

  getSnapshot(): ConsentSnapshot {
    return this.snapshotState();
  }

  canRun(category: Exclude<CookieCategory, 'necessary'>): boolean {
    return this.snapshotState().categories[category];
  }

  resetIfPolicyVersionChanged(currentVersion: string): void {
    if (!this.isBrowser()) {
      return;
    }
    const existing = this.readSnapshot();
    if (!existing || existing.policyVersion === currentVersion) {
      return;
    }
    this.cookieConsentLib?.reset(true);
    this.policyResetDuringInit = true;
    const next = this.createDefaultSnapshot('policy-reset', currentVersion);
    this.snapshotState.set(next);
    this.writeSnapshot(next);
  }

  private runMutation(mutation: () => void): void {
    if (!this.isBrowser()) {
      return;
    }

    if (this.initialized && this.cookieConsentLib) {
      mutation();
      this.syncSnapshotFromLibrary('updated');
      return;
    }

    void this.init().then(() => {
      if (!this.initialized || !this.cookieConsentLib) {
        return;
      }
      mutation();
      this.syncSnapshotFromLibrary('updated');
    });
  }

  private syncSnapshotFromLibrary(
    origin: ConsentSnapshot['origin'],
    existing: ConsentSnapshot | null = null,
  ): void {
    if (!this.cookieConsentLib) {
      return;
    }
    const snapshot: ConsentSnapshot = {
      categories: {
        necessary: true,
        analytics: this.cookieConsentLib.acceptedCategory('analytics'),
        marketing: this.cookieConsentLib.acceptedCategory('marketing'),
        preferences: this.cookieConsentLib.acceptedCategory('preferences'),
      },
      policyVersion: COOKIE_CONSENT_POLICY_VERSION,
      updatedAt: origin === 'restored' && existing?.updatedAt ? existing.updatedAt : new Date().toISOString(),
      origin,
    };

    this.snapshotState.set(snapshot);
    this.writeSnapshot(snapshot);
  }

  private createDefaultSnapshot(
    origin: ConsentSnapshot['origin'],
    policyVersion = COOKIE_CONSENT_POLICY_VERSION,
  ): ConsentSnapshot {
    return {
      categories: {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      },
      policyVersion,
      updatedAt: new Date().toISOString(),
      origin,
    };
  }

  private readSnapshot(): ConsentSnapshot | null {
    if (!this.isBrowser()) {
      return null;
    }

    let raw: string | null;
    try {
      raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    } catch {
      return null;
    }

    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!this.isConsentSnapshot(parsed)) {
        try {
          localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
        } catch {
          // Ignore storage cleanup failures.
        }
        return null;
      }
      return parsed;
    } catch {
      try {
        localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
      } catch {
        // Ignore storage cleanup failures.
      }
      return null;
    }
  }

  private writeSnapshot(snapshot: ConsentSnapshot): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore write failures (private mode/quota/etc.) and keep in-memory state.
    }
  }

  private async loadLibrary(): Promise<CookieConsentModule> {
    if (!this.cookieConsentLibPromise) {
      this.cookieConsentLibPromise = import('vanilla-cookieconsent');
    }
    return this.cookieConsentLibPromise;
  }

  private isConsentSnapshot(value: unknown): value is ConsentSnapshot {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as Partial<ConsentSnapshot>;
    if (
      typeof candidate.policyVersion !== 'string' ||
      typeof candidate.updatedAt !== 'string' ||
      !candidate.categories
    ) {
      return false;
    }

    const categories = candidate.categories as Partial<Record<CookieCategory, unknown>>;
    return (
      typeof categories.necessary === 'boolean' &&
      typeof categories.analytics === 'boolean' &&
      typeof categories.marketing === 'boolean' &&
      typeof categories.preferences === 'boolean'
    );
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private resolveActiveLocale(): (typeof APP_LOCALES)[number] {
    const activeLang = this.transloco.getActiveLang();
    const normalized = (activeLang.split('-')[0] ?? 'es').toLowerCase();
    return APP_LOCALES.find((locale) => locale === normalized) ?? 'es';
  }

  private async preloadTranslations(): Promise<void> {
    await Promise.all(
      APP_LOCALES.map(async (locale) => {
        try {
          await firstValueFrom(this.transloco.load(locale));
        } catch {
          // Keep initialization resilient if one locale cannot be loaded.
        }
      }),
    );
  }

  private buildTranslations(): Record<
    (typeof APP_LOCALES)[number],
    {
      consentModal: {
        title: string;
        description: string;
        acceptAllBtn: string;
        acceptNecessaryBtn: string;
        showPreferencesBtn: string;
      };
      preferencesModal: {
        title: string;
        acceptAllBtn: string;
        acceptNecessaryBtn: string;
        savePreferencesBtn: string;
        closeIconLabel: string;
        sections: Array<{ title: string; description?: string; linkedCategory?: CookieCategory }>;
      };
    }
  > {
    return APP_LOCALES.reduce(
      (acc, locale) => {
        acc[locale] = {
          consentModal: {
            title: this.transloco.translate('cookies.banner.title', {}, locale),
            description: this.transloco.translate('cookies.banner.description', {}, locale),
            acceptAllBtn: this.transloco.translate('cookies.actions.accept_all', {}, locale),
            acceptNecessaryBtn: this.transloco.translate(
              'cookies.actions.reject_non_essential',
              {},
              locale,
            ),
            showPreferencesBtn: this.transloco.translate('cookies.actions.configure', {}, locale),
          },
          preferencesModal: {
            title: this.transloco.translate('cookies.preferences.title', {}, locale),
            acceptAllBtn: this.transloco.translate('cookies.actions.accept_all', {}, locale),
            acceptNecessaryBtn: this.transloco.translate(
              'cookies.actions.reject_non_essential',
              {},
              locale,
            ),
            savePreferencesBtn: this.transloco.translate('cookies.actions.save_preferences', {}, locale),
            closeIconLabel: this.transloco.translate('cookies.preferences.close', {}, locale),
            sections: [
              {
                title: this.transloco.translate('cookies.preferences.sections.necessary.title', {}, locale),
                description: this.transloco.translate(
                  'cookies.preferences.sections.necessary.description',
                  {},
                  locale,
                ),
                linkedCategory: 'necessary',
              },
              {
                title: this.transloco.translate('cookies.preferences.sections.analytics.title', {}, locale),
                description: this.transloco.translate(
                  'cookies.preferences.sections.analytics.description',
                  {},
                  locale,
                ),
                linkedCategory: 'analytics',
              },
              {
                title: this.transloco.translate('cookies.preferences.sections.marketing.title', {}, locale),
                description: this.transloco.translate(
                  'cookies.preferences.sections.marketing.description',
                  {},
                  locale,
                ),
                linkedCategory: 'marketing',
              },
              {
                title: this.transloco.translate('cookies.preferences.sections.preferences.title', {}, locale),
                description: this.transloco.translate(
                  'cookies.preferences.sections.preferences.description',
                  {},
                  locale,
                ),
                linkedCategory: 'preferences',
              },
            ],
          },
        };
        return acc;
      },
      {} as Record<
        (typeof APP_LOCALES)[number],
        {
          consentModal: {
            title: string;
            description: string;
            acceptAllBtn: string;
            acceptNecessaryBtn: string;
            showPreferencesBtn: string;
          };
          preferencesModal: {
            title: string;
            acceptAllBtn: string;
            acceptNecessaryBtn: string;
            savePreferencesBtn: string;
            closeIconLabel: string;
            sections: Array<{ title: string; description?: string; linkedCategory?: CookieCategory }>;
          };
        }
      >,
    );
  }
}
