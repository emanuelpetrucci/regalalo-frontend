import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export const TOKEN_KEY = 'rgl_auth_token';
export const USER_KEY = 'rgl_auth_user';

/** Campos mínimos almacenados tras cualquier respuesta de autenticación (login o registro). */
export interface SessionUser {
  id: string;
  email: string;
  reputationScore: number;
  /** Opcional en lectura para sesiones legacy previas a DLT-003. */
  firstName?: string;
  /** Opcional en lectura para sesiones legacy previas a DLT-003. */
  lastName?: string;
  postalCode?: string;
  totalDonated?: number;
  totalReceived?: number;
  /** Ausente en sesiones legacy; el guard trata `undefined` como no verificado. */
  emailVerified?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly tokenState = signal<string | null>(this.readToken());
  private readonly userState = signal<SessionUser | null>(this.readUser());

  readonly isLoggedIn = computed(() => {
    const token = this.tokenState();
    if (!token) return false;
    const payload = this.decodePayload(token);
    return !!(payload?.exp && payload.exp * 1000 > Date.now());
  });

  readonly user = this.userState.asReadonly();

  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenState.set(token);
  }

  getToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return this.tokenState();
  }

  setUser(user: SessionUser): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userState.set(user);
  }

  getUser(): SessionUser | null {
    if (!this.isBrowser()) {
      return null;
    }
    return this.userState();
  }

  clearUser(): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(USER_KEY);
    this.userState.set(null);
  }

  clearToken(): void {
    if (!this.isBrowser()) {
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
    this.tokenState.set(null);
    this.clearUser();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    const payload = this.decodePayload(token);
    if (!payload?.exp || payload.exp * 1000 <= Date.now()) {
      this.clearToken();
      return false;
    }
    return true;
  }

  private readToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): SessionUser | null {
    if (!this.isBrowser()) {
      return null;
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private decodePayload(token: string): { exp?: number } | null {
    try {
      const base64 = token.split('.')[1];
      if (!base64) {
        return null;
      }
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json) as { exp?: number };
    } catch {
      return null;
    }
  }
}
