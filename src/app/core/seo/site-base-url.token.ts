import { InjectionToken } from '@angular/core';

/** URL pública del sitio (sin barra final). Prioridad: SITE_URL en SSR > environment.siteUrl */
export const SITE_BASE_URL = new InjectionToken<string>('SITE_BASE_URL');
