import { from, Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { ReportsService } from '../api/generated/services/reports.service';
import type { CreateReportRequest, CreateReportResponse } from '../api/generated/models';

export interface ReportContext {
  entityType: 'item' | 'user';
  entityId: string;
  entityDisplayName: string;
}

export type ReportReason = CreateReportRequest['reason'];

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly reportsApi = inject(ReportsService);

  submit(
    context: ReportContext,
    reason: ReportReason,
    description: string | null,
    recaptchaToken: string,
  ): Observable<CreateReportResponse> {
    return from(
      this.reportsApi.reportsPost({
        body: {
          reportedEntityType: context.entityType,
          reportedEntityId: context.entityId,
          reason,
          description: description ?? undefined,
          recaptchaToken,
        },
      }),
    );
  }
}
