import { HttpErrorResponse } from '@angular/common/http';

export interface RegisterErrorView {
  bannerKey?: string;
  showLoginLink?: boolean;
  fields?: Record<string, string>;
}

const FIELD_PATH_MAP: Record<string, string> = {
  email: 'email',
  password: 'password',
  postalcode: 'postalCode',
  postal_code: 'postalCode',
  firstname: 'firstName',
  first_name: 'firstName',
  lastname: 'lastName',
  last_name: 'lastName',
  phone: 'phone',
};

function mapErrorPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }
  const normalized = path.toLowerCase();
  return FIELD_PATH_MAP[normalized] ?? FIELD_PATH_MAP[path] ?? undefined;
}

export function mapRegisterError(err: unknown): RegisterErrorView {
  if (!(err instanceof HttpErrorResponse)) {
    return { bannerKey: 'auth.register.error.connection' };
  }

  switch (err.status) {
    case 409:
      return { bannerKey: 'auth.register.error.409', showLoginLink: true };
    case 422:
      return { bannerKey: 'auth.register.error.422' };
    case 400: {
      const body = err.error as {
        message?: string;
        errors?: { path?: string; message?: string }[];
      };
      const msg = body?.message ?? '';
      if (/postal|código|geocod/i.test(msg)) {
        return { fields: { postalCode: 'auth.register.error.postal_invalid' } };
      }
      const fields: Record<string, string> = {};
      for (const item of Array.isArray(body?.errors) ? body.errors : []) {
        const key = mapErrorPath(item.path);
        if (key) {
          fields[key] = 'auth.register.error.field_invalid';
        }
      }
      if (Object.keys(fields).length > 0) {
        return { fields };
      }
      return { bannerKey: 'auth.register.error.form_invalid' };
    }
    default:
      return { bannerKey: 'auth.register.error.generic' };
  }
}
