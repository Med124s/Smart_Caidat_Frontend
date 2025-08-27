// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';

export const authGuard: CanActivateFn = async () => {
  const oauth2AuthService = inject(Oauth2AuthService);
  const router = inject(Router);

  try {
    await oauth2AuthService.getKeycloakInstance().updateToken(30);

    if (oauth2AuthService.isAuthenticated()) {
      return true;
    } else {
      oauth2AuthService.login(); // redirection vers login
      return false;
    }
  } catch (e) {
    oauth2AuthService.login(); // en cas d’échec
    return false;
  }
};
