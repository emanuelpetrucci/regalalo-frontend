import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { createMockJwt } from '../testing/jwt-test-utils';
import { SessionService } from '../services/session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let session: SessionService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: class {} },
          { path: 'verificacion-pendiente', component: class {} },
        ]),
      ],
    });
    session = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('allows navigation with valid token and emailVerified true', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: true,
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/explorar' } as never),
    );

    expect(result).toBe(true);
  });

  it('redirects to verificacion-pendiente when emailVerified is false', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: false,
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/explorar' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.root.children['primary']?.segments[0]?.path).toBe('verificacion-pendiente');
  });

  it('redirects to verificacion-pendiente when emailVerified is undefined (legacy session)', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    session.setToken(createMockJwt(futureExp));
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/explorar' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.root.children['primary']?.segments[0]?.path).toBe('verificacion-pendiente');
  });

  it('redirects to login with returnUrl when unauthenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/explorar' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.root.children['primary']?.segments[0]?.path).toBe('login');
    expect(tree.queryParams['returnUrl']).toBe('/explorar');
  });

  it('redirects to login when token is expired', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    session.setToken(createMockJwt(pastExp));

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/mis-objetos' } as never),
    );

    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.queryParams['returnUrl']).toBe('/mis-objetos');
  });
});
