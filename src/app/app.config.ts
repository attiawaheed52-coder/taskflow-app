import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { taskReducer } from './core/store/task.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
     provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideStore({ taskState: taskReducer }),
    provideRouter(routes), provideClientHydration(withEventReplay())
  ]
};
