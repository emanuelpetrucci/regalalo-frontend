import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TOKEN_KEY, USER_KEY, SessionService } from '../services/session.service';
import { purgeAuthStorageGuard } from './guest-session.guard';

function createMockJwt(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.sig`;
}

describe('purgeAuthStorageGuard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('clears auth token and user from localStorage', async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(TOKEN_KEY, createMockJwt(futureExp));
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 'u1', email: 'a@b.es', reputationScore: 0 }));

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'login',
            canActivate: [purgeAuthStorageGuard],
            component: class {},
          },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/login');

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
    expect(TestBed.inject(SessionService).getToken()).toBeNull();
    expect(TestBed.inject(SessionService).getUser()).toBeNull();
  });

  it('does not remove unrelated localStorage keys', async () => {
    localStorage.setItem(TOKEN_KEY, createMockJwt(Math.floor(Date.now() / 1000) + 3600));
    localStorage.setItem('rgl_locale', 'ca');

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'login',
            canActivate: [purgeAuthStorageGuard],
            component: class {},
          },
        ]),
      ],
    }).compileComponents();

    await TestBed.inject(Router).navigateByUrl('/login');

    expect(localStorage.getItem('rgl_locale')).toBe('ca');
  });
});
