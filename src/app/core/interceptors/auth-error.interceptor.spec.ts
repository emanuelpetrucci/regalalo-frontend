import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, provideRouter, Router } from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';
import { createMockJwt } from '../testing/jwt-test-utils';
import { SessionService, TOKEN_KEY } from '../services/session.service';
import { authErrorInterceptor } from './auth-error.interceptor';

describe('authErrorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: SessionService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'login', component: class {} },
          { path: 'explorar', component: class {} },
          { path: 'verificacion-pendiente', component: class {} },
        ]),
        provideHttpClient(withInterceptors([authErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('clears token and redirects on 401 for non-auth endpoints', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    await router.navigateByUrl('/explorar');

    const navigationDone = firstValueFrom(
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    );

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    await navigationDone;

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(router.url).toContain('/login');
    expect(router.url).toContain('returnUrl');
  });

  it('does not redirect on 401 for public auth endpoints', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    await router.navigateByUrl('/explorar');

    http
      .post('http://localhost:3000/api/auth/login', {})
      .subscribe({ error: () => undefined });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(router.url).toBe('/explorar');
  });

  it('does not redirect when already on login', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    await router.navigateByUrl('/login');

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(router.url).toBe('/login');
  });

  it('keeps token and redirects on 403 EMAIL_NOT_VERIFIED', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: true,
    });
    await router.navigateByUrl('/explorar');

    const navigationDone = firstValueFrom(
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    );

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush(
      { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' },
      { status: 403, statusText: 'Forbidden' },
    );

    await navigationDone;

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(session.getUser()?.emailVerified).toBe(false);
    expect(router.url).toBe('/verificacion-pendiente');
  });

  it('does not redirect on 403 EMAIL_NOT_VERIFIED when already on verificacion-pendiente', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    session.setUser({
      id: 'u1',
      email: 'test@example.com',
      reputationScore: 0,
      emailVerified: true,
    });
    await router.navigateByUrl('/verificacion-pendiente');

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush(
      { code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' },
      { status: 403, statusText: 'Forbidden' },
    );

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(session.getUser()?.emailVerified).toBe(false);
    expect(router.url).toBe('/verificacion-pendiente');
  });

  it('does not redirect on 403 with other body', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    await router.navigateByUrl('/explorar');

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush({ code: 'FORBIDDEN', message: 'Access denied' }, {
      status: 403,
      statusText: 'Forbidden',
    });

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(router.url).toBe('/explorar');
  });

  it('uses rgl_relogin_return flag as returnUrl on 401 and consumes it', async () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);
    sessionStorage.setItem('rgl_relogin_return', '/perfil');
    await router.navigateByUrl('/explorar');

    const navigationDone = firstValueFrom(
      router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)),
    );

    http.get('http://localhost:3000/api/items').subscribe({
      error: () => undefined,
    });

    const req = httpMock.expectOne('http://localhost:3000/api/items');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    await navigationDone;

    expect(sessionStorage.getItem('rgl_relogin_return')).toBeNull();
    expect(router.url).toContain('returnUrl=%2Fperfil');
  });
});
