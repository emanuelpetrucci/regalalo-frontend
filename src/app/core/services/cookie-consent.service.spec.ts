import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { vi } from 'vitest';
import * as CookieConsent from 'vanilla-cookieconsent';
import { COOKIE_CONSENT_POLICY_VERSION } from '../config/cookie-consent.config';
import { CookieConsentService } from './cookie-consent.service';

type CategoryState = Record<'analytics' | 'marketing' | 'preferences', boolean>;

describe('CookieConsentService', () => {
  let service: CookieConsentService;
  let categoryState: CategoryState;
  const esJson = {
    cookies: {
      banner: {
        title: 'Usamos cookies',
        description: 'Solo las necesarias y opcionales configurables.',
      },
      actions: {
        accept_all: 'Aceptar todo',
        reject_non_essential: 'Rechazar no esenciales',
        configure: 'Configurar',
        save_preferences: 'Guardar preferencias',
      },
      preferences: {
        title: 'Preferencias de cookies',
        close: 'Cerrar panel de preferencias de cookies',
        sections: {
          necessary: { title: 'Cookies necesarias', description: 'Siempre activas.' },
          analytics: { title: 'Cookies de analítica', description: 'Métricas agregadas.' },
          marketing: { title: 'Cookies de marketing', description: 'Contenido promocional.' },
          preferences: { title: 'Cookies de preferencias', description: 'Ajustes de experiencia.' },
        },
      },
    },
  };

  beforeEach(() => {
    localStorage.clear();
    categoryState = { analytics: false, marketing: false, preferences: false };

    vi.spyOn(CookieConsent, 'run').mockResolvedValue();
    vi.spyOn(CookieConsent, 'reset').mockImplementation(() => undefined);
    vi.spyOn(CookieConsent, 'acceptedCategory').mockImplementation(
      (category: string) => categoryState[category as keyof CategoryState] ?? false,
    );
    vi.spyOn(CookieConsent, 'acceptCategory').mockImplementation(
      (categories: string | string[], excluded?: string[]) => {
        const list = Array.isArray(categories) ? categories : [categories];
        if (excluded) {
          excluded.forEach((category) => {
            if (category in categoryState) {
              categoryState[category as keyof CategoryState] = false;
            }
          });
        }
        list.forEach((category) => {
          if (category in categoryState) {
            categoryState[category as keyof CategoryState] = true;
          }
        });
      },
    );
    vi.spyOn(CookieConsent, 'showPreferences').mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: esJson, ca: esJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'en', 'ca'] },
        }),
      ],
    });
    service = TestBed.inject(CookieConsentService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicializa una sola vez (idempotente)', async () => {
    await service.init();
    await service.init();

    expect(CookieConsent.run).toHaveBeenCalledTimes(1);
  });

  it('muestra banner en primera visita sin snapshot previo', async () => {
    await service.init();

    expect(CookieConsent.run).toHaveBeenCalledWith(
      expect.objectContaining({
        autoShow: true,
        disablePageInteraction: false,
      }),
    );
  });

  it('mantiene necessary siempre activa', async () => {
    await service.init();

    expect(service.getSnapshot().categories.necessary).toBe(true);
  });

  it('rejectNonEssential desactiva analytics/marketing/preferences', async () => {
    await service.init();
    service.acceptAll();
    service.rejectNonEssential();

    const snapshot = service.getSnapshot();
    expect(snapshot.categories.analytics).toBe(false);
    expect(snapshot.categories.marketing).toBe(false);
    expect(snapshot.categories.preferences).toBe(false);
    expect(snapshot.categories.necessary).toBe(true);
  });

  it('acceptAll habilita categorias opcionales y persiste snapshot para recarga', async () => {
    await service.init();

    service.acceptAll();
    await vi.waitFor(() => {
      expect(service.getSnapshot().categories).toEqual({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      });
    });

    const snapshot = service.getSnapshot();
    expect(snapshot.categories.marketing).toBe(true);

    const persistedRaw = localStorage.getItem('rgl_cookie_consent_snapshot');
    expect(persistedRaw).toBeTruthy();
    const persisted = JSON.parse(persistedRaw ?? '{}') as {
      categories: Record<string, boolean>;
      origin: string;
      policyVersion: string;
    };

    expect(persisted.policyVersion).toBe(COOKIE_CONSENT_POLICY_VERSION);
    expect(persisted.origin).toBe('updated');
    expect(persisted.categories['analytics']).toBe(true);
    expect(persisted.categories['marketing']).toBe(true);
    expect(persisted.categories['preferences']).toBe(true);
  });

  it('invalida snapshot previo cuando cambia policyVersion', async () => {
    await service.init();
    localStorage.setItem(
      'rgl_cookie_consent_snapshot',
      JSON.stringify({
        categories: {
          necessary: true,
          analytics: true,
          marketing: true,
          preferences: true,
        },
        policyVersion: '2026-01-01',
        updatedAt: '2026-01-01T00:00:00.000Z',
        origin: 'updated',
      }),
    );
    service.resetIfPolicyVersionChanged(COOKIE_CONSENT_POLICY_VERSION);

    expect(CookieConsent.reset).toHaveBeenCalledWith(true);
    expect(service.getSnapshot().policyVersion).toBe(COOKIE_CONSENT_POLICY_VERSION);
    expect(service.getSnapshot().origin).toBe('policy-reset');
  });

  it('canRun refleja estado por categoria', async () => {
    await service.init();
    service.setPreferences({ analytics: true, marketing: false, preferences: true });
    await vi.waitFor(() => {
      expect(service.canRun('analytics')).toBe(true);
      expect(service.canRun('marketing')).toBe(false);
      expect(service.canRun('preferences')).toBe(true);
    });

    expect(service.getSnapshot().categories.marketing).toBe(false);
  });

  it('configura categorias y textos i18n para banner y preferencias', async () => {
    await service.init();

    const runConfig = vi.mocked(CookieConsent.run).mock.calls[0]?.[0] as any;

    expect(runConfig).toBeDefined();
    expect(runConfig?.categories).toEqual(
      expect.objectContaining({
        necessary: expect.objectContaining({ enabled: true, readOnly: true }),
        analytics: expect.any(Object),
        marketing: expect.any(Object),
        preferences: expect.any(Object),
      }),
    );

    const esTranslation = runConfig?.language?.translations?.['es'] as any;
    expect(esTranslation?.consentModal?.title).toBeTruthy();
    expect(esTranslation?.consentModal?.acceptAllBtn).toBeTruthy();
    expect(esTranslation?.preferencesModal?.title).toBeTruthy();
    expect(esTranslation?.preferencesModal?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ linkedCategory: 'necessary' }),
        expect.objectContaining({ linkedCategory: 'analytics' }),
        expect.objectContaining({ linkedCategory: 'marketing' }),
        expect.objectContaining({ linkedCategory: 'preferences' }),
      ]),
    );

    expect(CookieConsent.run).toHaveBeenCalledWith(
      expect.objectContaining({
        guiOptions: expect.objectContaining({
          consentModal: expect.objectContaining({ equalWeightButtons: true }),
          preferencesModal: expect.objectContaining({ equalWeightButtons: true }),
        }),
        language: expect.objectContaining({
          default: 'es',
          translations: expect.objectContaining({
            es: expect.any(Object),
            ca: expect.any(Object),
            en: expect.any(Object),
          }),
        }),
      }),
    );

    expect(esTranslation?.preferencesModal?.closeIconLabel).toBeTruthy();
  });

  it('define contrato accesible del panel de preferencias en configuracion', async () => {
    await service.init();

    const runConfig = vi.mocked(CookieConsent.run).mock.calls[0]?.[0] as any;
    const preferencesModal = runConfig?.guiOptions?.preferencesModal;
    const esTranslation = runConfig?.language?.translations?.['es'] as any;

    expect(preferencesModal).toEqual(
      expect.objectContaining({
        layout: 'box',
        equalWeightButtons: true,
      }),
    );
    expect(esTranslation?.preferencesModal?.title).toBeTruthy();
    expect(esTranslation?.preferencesModal?.closeIconLabel).toBeTruthy();
    expect(esTranslation?.preferencesModal?.savePreferencesBtn).toBeTruthy();
    expect(esTranslation?.preferencesModal?.sections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ linkedCategory: 'necessary' }),
        expect.objectContaining({ linkedCategory: 'analytics' }),
        expect.objectContaining({ linkedCategory: 'marketing' }),
        expect.objectContaining({ linkedCategory: 'preferences' }),
      ]),
    );
  });

  it('recupera inicializacion tras un fallo inicial en run()', async () => {
    vi.spyOn(CookieConsent, 'run')
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce();

    await service.init();
    await service.init();

    expect(CookieConsent.run).toHaveBeenCalledTimes(2);
  });

  it('preserva updatedAt al restaurar snapshot', async () => {
    const restoredUpdatedAt = '2026-01-01T00:00:00.000Z';
    localStorage.setItem(
      'rgl_cookie_consent_snapshot',
      JSON.stringify({
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
        policyVersion: COOKIE_CONSENT_POLICY_VERSION,
        updatedAt: restoredUpdatedAt,
        origin: 'updated',
      }),
    );
    categoryState = { analytics: true, marketing: false, preferences: true };

    await service.init();

    expect(service.getSnapshot().updatedAt).toBe(restoredUpdatedAt);
    expect(service.getSnapshot().origin).toBe('restored');
  });

  it('no reutiliza updatedAt anterior si se resetea por cambio de policyVersion', async () => {
    const outdatedUpdatedAt = '2026-01-01T00:00:00.000Z';
    localStorage.setItem(
      'rgl_cookie_consent_snapshot',
      JSON.stringify({
        categories: {
          necessary: true,
          analytics: true,
          marketing: true,
          preferences: true,
        },
        policyVersion: '2026-01-01',
        updatedAt: outdatedUpdatedAt,
        origin: 'updated',
      }),
    );

    await service.init();

    const snapshot = service.getSnapshot();
    expect(snapshot.policyVersion).toBe(COOKIE_CONSENT_POLICY_VERSION);
    expect(snapshot.updatedAt).not.toBe(outdatedUpdatedAt);
    expect(snapshot.origin).toBe('updated');
  });

  it('tolera storage restringido sin romper init', async () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('storage blocked');
      });

    await expect(service.init()).resolves.toBeUndefined();
    service.acceptAll();
    await Promise.resolve();

    expect(setItemSpy).toHaveBeenCalled();
  });

  it('no ejecuta libreria fuera de browser', async () => {
    vi.spyOn(service as any, 'isBrowser').mockReturnValue(false);

    await service.init();
    service.acceptAll();
    service.rejectNonEssential();
    service.setPreferences({ analytics: true });

    expect(CookieConsent.run).not.toHaveBeenCalled();
    expect(CookieConsent.acceptCategory).not.toHaveBeenCalled();
  });

  it('openPreferences abre el panel de preferencias', async () => {
    await service.init();

    service.openPreferences();

    expect(CookieConsent.showPreferences).toHaveBeenCalledTimes(1);
  });

  it('openPreferences inicializa bajo demanda si aun no estaba listo', async () => {
    service.openPreferences();

    await vi.waitFor(() => {
      expect(CookieConsent.run).toHaveBeenCalledTimes(1);
      expect(CookieConsent.showPreferences).toHaveBeenCalledTimes(1);
    });
  });

  it('reapertura + cambio de preferencias actualiza snapshot persistido', async () => {
    await service.init();
    const before = service.getSnapshot();

    service.openPreferences();
    service.setPreferences({ analytics: true, marketing: false, preferences: true });
    await vi.waitFor(() => {
      expect(service.getSnapshot().categories).toEqual({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      });
    });

    const after = service.getSnapshot();
    expect(CookieConsent.showPreferences).toHaveBeenCalledTimes(1);
    expect(after.categories).toEqual({
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: true,
    });
    expect(after.policyVersion).toBe(COOKIE_CONSENT_POLICY_VERSION);
    expect(new Date(after.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(before.updatedAt).getTime(),
    );

    const persistedRaw = localStorage.getItem('rgl_cookie_consent_snapshot');
    expect(persistedRaw).toBeTruthy();
    const persisted = JSON.parse(persistedRaw ?? '{}') as {
      categories: Record<string, boolean>;
      policyVersion: string;
    };
    expect(persisted.policyVersion).toBe(COOKIE_CONSENT_POLICY_VERSION);
    expect(persisted.categories['analytics']).toBe(true);
    expect(persisted.categories['preferences']).toBe(true);
  });
});
