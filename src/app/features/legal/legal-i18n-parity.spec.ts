import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { describe, expect, it } from 'vitest';
import caJson from '../../../../public/i18n/ca.json';
import enJson from '../../../../public/i18n/en.json';
import esJson from '../../../../public/i18n/es.json';
import {
  COOKIE_CONSENT_POLICY_VERSION,
  COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY,
} from '../../core/config/cookie-consent.config';
import { CookieConsentService } from '../../core/services/cookie-consent.service';

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

function collectKeyPaths(value: JsonValue, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return prefix ? [prefix] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectKeyPaths(item, `${prefix}.${index}`));
  }
  return Object.entries(value).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
      return collectKeyPaths(nested, path);
    }
    if (Array.isArray(nested)) {
      return collectKeyPaths(nested, path);
    }
    return [path];
  });
}

function legalRoot(json: { legal: unknown }): JsonObject {
  return json.legal as JsonObject;
}

function legalCookiesSections(json: { legal: unknown }): JsonObject {
  return (legalRoot(json)['cookies'] as JsonObject)['sections'] as JsonObject;
}

function assertSnapshotStorageKeyReferenced(json: { legal: unknown }): void {
  const consent = legalCookiesSections(json)['consent'] as JsonObject;
  expect(consent['footer_cookie']).toBe(COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY);

  const table = legalCookiesSections(json)['table'] as JsonObject;
  const rows = table['rows'] as JsonObject;
  const snapshotRow = Object.values(rows).find(
    (row) => (row as JsonObject)['0'] === COOKIE_CONSENT_SNAPSHOT_STORAGE_KEY,
  );
  expect(snapshotRow).toBeTruthy();
}

describe('legal i18n parity', () => {
  const esLegalPaths = collectKeyPaths(esJson.legal as JsonObject, 'legal').sort();
  const caLegalPaths = collectKeyPaths(caJson.legal as JsonObject, 'legal').sort();
  const enLegalPaths = collectKeyPaths(enJson.legal as JsonObject, 'legal').sort();

  it('legal table headers use indexed objects (Transloco cannot resolve array.0 paths)', () => {
    const sections = ((esJson.legal as JsonObject)['privacy'] as JsonObject)['sections'] as JsonObject;
    const tableHeaders = ((sections['data'] as JsonObject)['table'] as JsonObject)['headers'];
    expect(Array.isArray(tableHeaders)).toBe(false);
    expect((tableHeaders as JsonObject)['0']).toBe('Categoría');
  });

  it('ca.json contains the same legal.* key paths as es.json', () => {
    expect(caLegalPaths).toEqual(esLegalPaths);
  });

  it('en.json contains the same legal.* key paths as es.json', () => {
    expect(enLegalPaths).toEqual(esLegalPaths);
  });

  it('legal.common.policy_version matches COOKIE_CONSENT_POLICY_VERSION in all locales', () => {
    for (const json of [esJson, caJson, enJson]) {
      const common = legalRoot(json)['common'] as JsonObject;
      expect(common['policy_version']).toBe(COOKIE_CONSENT_POLICY_VERSION);
    }
  });

  it('documents consent categories aligned with CookieConsentService', () => {
    const types = legalCookiesSections(esJson)['types'] as JsonObject;
    const cardKeys = Object.keys((types['cards'] as JsonObject) ?? {}).sort();
    expect(cardKeys).toEqual(['analytics', 'marketing', 'necessary', 'preferences']);

    const toggles = ((legalCookiesSections(esJson)['manage'] as JsonObject)['toggles'] as JsonObject) ?? {};
    expect(Object.keys(toggles).sort()).toEqual(['analytics', 'marketing', 'necessary', 'preferences']);
  });

  it('documents real storage keys (no fictional first-party HTTP cookies)', () => {
    const rows = ((legalCookiesSections(esJson)['table'] as JsonObject)['rows'] as JsonObject) ?? {};
    const names = Object.values(rows).map((row) => (row as JsonObject)['0']);
    expect(names).toContain('rgl_auth_token');
    expect(names).toContain('rgl_cookie_consent_snapshot');
    expect(names).not.toContain('rgl_session');
    expect(names).not.toContain('rgl_csrf');
  });

  it('references the real consent snapshot storage key in es, ca and en', () => {
    assertSnapshotStorageKeyReferenced(esJson);
    assertSnapshotStorageKeyReferenced(caJson);
    assertSnapshotStorageKeyReferenced(enJson);
  });

  it('optional CMP categories are disabled by default in CookieConsentService', () => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { es: esJson, en: enJson, ca: caJson },
          translocoConfig: { defaultLang: 'es', availableLangs: ['es', 'ca', 'en'] },
        }),
      ],
    });
    const service = TestBed.inject(CookieConsentService);
    expect(service.canRun('analytics')).toBe(false);
    expect(service.canRun('marketing')).toBe(false);
    expect(service.canRun('preferences')).toBe(false);
  });
});
