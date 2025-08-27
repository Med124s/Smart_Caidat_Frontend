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

// // 🔐 Création instance Keycloak
// const keycloak = new Keycloak({
//   url: environment.keycloak.url,
//   realm: environment.keycloak.realm,
//   clientId: environment.keycloak.clientId,
// });

// // 🛑 Initialisation avant le lancement de l'app
// keycloak
//   .init({
//     onLoad: 'check-sso',
//     silentCheckSsoRedirectUri: window.location.origin + '/assets/silentCheckSsoRedirectUri.html',
//     pkceMethod: 'S256',
//     redirectUri: 'http://localhost:4200/',
//     flow: 'standard',
//   })
//   .then((authenticated) => {
//     if (authenticated) {
//       console.log('🔐 Authenticated with Keycloak');

//       bootstrapApplication(AppComponent, {
//         providers: [
//           importProvidersFrom(BrowserModule, AppRoutingModule, HttpClientModule),
//           provideAnimations(),
//           provideHttpClient(withInterceptors([authInterceptor, authExpiredInterceptor])),
//           { provide: 'KEYCLOAK', useValue: keycloak },
//         ],
//       });
//     } else {
//       console.warn('❌ Not authenticated');
//       keycloak.login(); // Redirige vers la page de login si non connecté
//     }
//   })
//   .catch((err) => {
//     console.error('Keycloak init failed', err);
//   });


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
    }],
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
