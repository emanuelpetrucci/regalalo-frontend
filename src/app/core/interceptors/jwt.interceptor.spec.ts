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
import { createMockJwt } from '../testing/jwt-test-utils';
import { ApiConfiguration } from '../api/generated/api-configuration';
import { SessionService } from '../services/session.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let session: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds Authorization Bearer header when token exists and URL is API', () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    const config = TestBed.inject(ApiConfiguration);
    session.setToken(token);

    const apiUrl = `${config.rootUrl}/items`;
    http.get(apiUrl).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('does not add Authorization header when URL is NOT API (external or asset)', () => {
    const token = createMockJwt(Math.floor(Date.now() / 1000) + 3600);
    session.setToken(token);

    const assetUrl = '/assets/logo.png';
    const externalUrl = 'https://analytics.google.com/collect';

    http.get(assetUrl).subscribe();
    http.get(externalUrl).subscribe();

    const assetReq = httpMock.expectOne(assetUrl);
    expect(assetReq.request.headers.has('Authorization')).toBe(false);
    assetReq.flush({});

    const externalReq = httpMock.expectOne(externalUrl);
    expect(externalReq.request.headers.has('Authorization')).toBe(false);
    externalReq.flush({});
  });

  it('does not add Authorization header without token', () => {
    http.get('/api/items').subscribe();

    const req = httpMock.expectOne('/api/items');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add Authorization header with expired token', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const config = TestBed.inject(ApiConfiguration);
    session.setToken(createMockJwt(pastExp));

    const apiUrl = `${config.rootUrl}/items`;
    http.get(apiUrl).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
