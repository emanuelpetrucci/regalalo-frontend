import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: 'ca', renderMode: RenderMode.Prerender },
  { path: 'como-funciona/reputacion', renderMode: RenderMode.Prerender },
  { path: 'ca/com-funciona/reputacio', renderMode: RenderMode.Prerender },
  { path: 'en/how-it-works/reputation', renderMode: RenderMode.Prerender },
  { path: 'explorar', renderMode: RenderMode.Server },
  { path: 'items/:slug', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
