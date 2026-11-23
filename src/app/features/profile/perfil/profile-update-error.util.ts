import { HttpErrorResponse } from '@angular/common/http';

export interface ProfileUpdateErrorView {
  bannerKey?: string;
  fields?: Record<string, string>;
}

const FIELD_PATH_MAP: Record<string, string> = {
  firstname: 'firstName',
  first_name: 'firstName',
  lastname: 'lastName',
  last_name: 'lastName',
  phone: 'phone',
  avatarurl: 'avatarUrl',
  avatar_url: 'avatarUrl',
  postalcode: 'postalCode',
  postal_code: 'postalCode',
  preferredlanguage: 'preferredLanguage',
  preferred_language: 'preferredLanguage',
};

const FIELD_ERROR_KEYS: Record<string, string> = {
  firstName: 'profile.settings.error.field_invalid',
  lastName: 'profile.settings.error.field_invalid',
  phone: 'profile.settings.error.field_invalid',
  avatarUrl: 'profile.settings.error.field_invalid',
  postalCode: 'profile.settings.error.postal_invalid',
  preferredLanguage: 'profile.settings.error.field_invalid',
};

function mapErrorPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  const normalized = path.toLowerCase();
  return FIELD_PATH_MAP[normalized] ?? FIELD_PATH_MAP[path] ?? undefined;
}

export function mapProfileUpdateError(err: unknown): ProfileUpdateErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'profile.settings.error.generic' };
  }

  if (err.status === 400) {
    const body = err.error as {
      message?: string;
      errors?: { path?: string; message?: string }[];
    };
    const msg = body?.message ?? '';
    if (/postal|código|geocod/i.test(msg)) {
      return { fields: { postalCode: 'profile.settings.error.postal_invalid' } };
    }
    const fields: Record<string, string> = {};
    for (const item of Array.isArray(body?.errors) ? body.errors : []) {
      const key = mapErrorPath(item.path);
      if (key) {
        fields[key] = FIELD_ERROR_KEYS[key] ?? 'profile.settings.error.field_invalid';
      }
    }
    if (Object.keys(fields).length > 0) {
      return { fields };
    }
    return { bannerKey: 'profile.settings.error.generic' };
  }

  return { bannerKey: 'profile.settings.error.generic' };
}
