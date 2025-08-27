import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(Oauth2AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (!token) {
    authService.login();
    return false;
  }
  const decoded = decodeJwt(token);
  const roles: string[] = decoded?.realm_access?.roles || [];
  if (roles.includes('ROLE_ADMIN')) {
    
    
    return true;
  } else {
    router.navigate(['/errors/404']);
    return false;
  }
};

function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    console.log(JSON.parse(atob(payload)));
    
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
}
