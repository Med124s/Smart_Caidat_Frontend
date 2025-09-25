import { APP_INITIALIZER, enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/modules/auth/http-auth.interceptor';
import { authExpiredInterceptor } from './app/modules/auth/auth-expired.interceptor';
import { Oauth2AuthService } from './app/modules/auth/oauth2-auth.service';
import 'chart.js/auto';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';


if (environment.production) {
  enableProdMode();
  //show this warning only on prod mode
  if (window) {
    selfXSSWarning();
  }
}

export function initializeAppFactory(authService: Oauth2AuthService): () => Promise<any> {
  return () => authService.initializeApp();
}

bootstrapApplication(AppComponent, {
  providers: [
    Oauth2AuthService,
    importProvidersFrom(BrowserModule, AppRoutingModule, HttpClientModule), provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, authExpiredInterceptor])),
   {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [Oauth2AuthService],
      multi: true
    },
    provideCharts(withDefaultRegisterables())
  ],
}).catch((err) => console.error(err));

function selfXSSWarning() {
  setTimeout(() => {
    console.log(
      '%c** STOP **',
      'font-weight:bold; font: 2.5em Arial; color: white; background-color: #e11d48; padding-left: 15px; padding-right: 15px; border-radius: 25px; padding-top: 5px; padding-bottom: 5px;',
    );
    console.log(
      `\n%cThis is a browser feature intended for developers. Using this console may allow attackers to impersonate you and steal your information sing an attack called Self-XSS. Do not enter or paste code that you do not understand.`,
      'font-weight:bold; font: 2em Arial; color: #e11d48;',
    );
  });
}
