import { TestBed } from '@angular/core/testing';
import type { AuthUser } from '../api/generated/models/auth-user';
import { createMockJwt } from '../testing/jwt-test-utils';
import { SessionService, TOKEN_KEY, USER_KEY } from './session.service';

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Ana',
  lastName: 'García',
  postalCode: '28001',
  reputationScore: 0,
  totalDonated: 0,
  totalReceived: 0,
};

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('setToken, getToken and clearToken use localStorage', () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    service.setToken(token);

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(service.getToken()).toBe(token);

    service.clearToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('isAuthenticated returns true for non-expired JWT', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    service.setToken(createMockJwt(futureExp));

    expect(service.isAuthenticated()).toBe(true);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('isAuthenticated returns false for expired JWT', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    service.setToken(createMockJwt(pastExp));

    expect(service.isAuthenticated()).toBe(false);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('isAuthenticated returns false without token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns false and clears JWT without exp claim', () => {
    service.setToken('e30.eyJ9.sig');

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('setUser, getUser and clearUser use localStorage', () => {
    service.setUser(mockUser);

    expect(localStorage.getItem(USER_KEY)).toContain('test@example.com');
    expect(service.getUser()?.id).toBe('user-1');
    expect(service.user()?.email).toBe('test@example.com');

    service.clearUser();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(service.getUser()).toBeNull();
  });

  it('persists emailVerified in localStorage', () => {
    service.setUser({ ...mockUser, emailVerified: true });

    expect(JSON.parse(localStorage.getItem(USER_KEY)!).emailVerified).toBe(true);

    service.setUser({ ...mockUser, emailVerified: false });
    expect(service.getUser()?.emailVerified).toBe(false);
  });

  it('clearToken also clears user', () => {
    service.setToken(createMockJwt(Math.floor(Date.now() / 1000) + 3600));
    service.setUser(mockUser);

    service.clearToken();

    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(service.getUser()).toBeNull();
  });
});
