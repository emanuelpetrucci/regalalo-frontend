import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authErrorInterceptor } from '../interceptors/auth-error.interceptor';
import { jwtInterceptor } from '../interceptors/jwt.interceptor';
import { ssrApiUrlInterceptor } from '../interceptors/ssr-api-url.interceptor';
import { provideApiConfiguration } from './generated/api-configuration';
import { environment } from '../../../environments/environment';

export function provideApiClient(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor, ssrApiUrlInterceptor, authErrorInterceptor]),
    ),
    provideApiConfiguration(environment.apiUrl),
  ]);
}
