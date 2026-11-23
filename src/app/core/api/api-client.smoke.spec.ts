import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApiConfiguration } from './generated/api-configuration';
import { ItemsService } from './generated/services/items.service';
import { jwtInterceptor } from '../interceptors/jwt.interceptor';

describe('generated API client smoke', () => {
  let service: ItemsService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideApiConfiguration(apiUrl),
        ItemsService,
      ],
    });

    service = TestBed.inject(ItemsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('ItemsService uses configured apiUrl base path', () => {
    void service.itemsGet();

    const req = httpMock.expectOne(`${apiUrl}/items`);
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], pagination: { page: 1, limit: 20, total: 0 } });
  });
});
