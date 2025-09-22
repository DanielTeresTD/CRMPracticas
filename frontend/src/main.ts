import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app/app.routes';

// Component app is the default
bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // Activate and inject HttpClient service
  ]
})
  .catch((err) => console.error(err));
