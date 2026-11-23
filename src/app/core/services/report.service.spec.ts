import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ReportService, ReportContext, ReportReason } from './report.service';
import { ReportsService } from '../api/generated/services/reports.service';
import type { CreateReportResponse } from '../api/generated/models';

const mockResponse: CreateReportResponse = { id: 'uuid-123', message: 'Report created' };

describe('ReportService', () => {
  let service: ReportService;
  let reportsApiSpy: { reportsPost: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reportsApiSpy = { reportsPost: vi.fn().mockResolvedValue(mockResponse) };

    TestBed.configureTestingModule({
      providers: [
        ReportService,
        { provide: ReportsService, useValue: reportsApiSpy },
      ],
    });
    service = TestBed.inject(ReportService);
  });

  const context: ReportContext = {
    entityType: 'item',
    entityId: 'item-uuid-456',
    entityDisplayName: 'Sofá de tres plazas',
  };
  const reason: ReportReason = 'spam';
  const description = 'Descripción de prueba';
  const recaptchaToken = 'test-token';

  it('llama reportsPost con el payload correcto (AC-REP-FE-16)', async () => {
    const result = await firstValueFrom(service.submit(context, reason, description, recaptchaToken));

    expect(reportsApiSpy.reportsPost).toHaveBeenCalledWith({
      body: {
        reportedEntityType: 'item',
        reportedEntityId: 'item-uuid-456',
        reason: 'spam',
        description: 'Descripción de prueba',
        recaptchaToken: 'test-token',
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it('convierte description null a undefined en el payload', async () => {
    await firstValueFrom(service.submit(context, reason, null, recaptchaToken));

    const callArg = reportsApiSpy.reportsPost.mock.calls[0][0];
    expect(callArg.body.description).toBeUndefined();
  });

  it('funciona con entityType user', async () => {
    const userContext: ReportContext = {
      entityType: 'user',
      entityId: 'user-uuid-789',
      entityDisplayName: 'María G.',
    };
    await firstValueFrom(service.submit(userContext, 'comportamiento_abusivo', null, recaptchaToken));

    const callArg = reportsApiSpy.reportsPost.mock.calls[0][0];
    expect(callArg.body.reportedEntityType).toBe('user');
    expect(callArg.body.reason).toBe('comportamiento_abusivo');
  });

  it('retorna un Observable que emite la respuesta de la API', async () => {
    const result = await firstValueFrom(service.submit(context, reason, description, recaptchaToken));

    expect(result.id).toBe('uuid-123');
    expect(result.message).toBe('Report created');
  });
});
