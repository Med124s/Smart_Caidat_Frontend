import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from '../../../../../core/services/theme.service';
import { ClickOutsideDirective } from '../../../../../shared/directives/click-outside.directive';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';

@Component({
  selector: 'app-profile-menu',
  templateUrl: './profile-menu.component.html',
  styleUrls: ['./profile-menu.component.css'],
  imports: [ClickOutsideDirective, NgClass, AngularSvgIconModule],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class ProfileMenuComponent {
  public isOpen = false;
  private _router = inject(Router)
  public profileMenu = [
    {
      title: 'Mon profil',
      icon: './assets/icons/heroicons/outline/user-circle.svg',
      clickLink:()=> this.profile(),
     
    },
    {
      title: 'Modifier le profil',
      icon: './assets/icons/heroicons/outline/cog-6-tooth.svg',
      clickLink:()=> this.editProfile(),
    },
    {
      title: 'Se déconnecter',
      icon: './assets/icons/heroicons/outline/logout.svg',
      link: '',
      clickLink:()=>this.logout()
    },
  ];

  public themeColors = [
    {
      name: 'base',
      code: '#e11d48',
    },
    {
      name: 'yellow',
      code: '#f59e0b',
    },
    {
      name: 'green',
      code: '#22c55e',
    },
    {
      name: 'blue',
      code: '#3b82f6',
    },
    {
      name: 'orange',
      code: '#ea580c',
    },
    {
      name: 'red',
      code: '#cc0022',
    },
    {
      name: 'violet',
      code: '#6d28d9',
    },
  ];

  public themeMode = ['light', 'dark'];
  public themeDirection = ['ltr', 'rtl'];

  public themeService = inject(ThemeService);
  oauth2Service = inject(Oauth2AuthService);
  connectedUser: ConnectedUser | undefined;
  // offCanvasService = inject(NgbOffcanvas);

  constructor() {
    this.listenToFetchUser();
  }

  private listenToFetchUser() {
    effect(() => {
      const userState = this.oauth2Service.fetchUser();
      if (userState.status === "OK"
        && userState.value?.email
        && userState.value.email !== this.oauth2Service.notConnected) {
        this.connectedUser = userState.value;
      }
    });
  }

  profile():void{
     this.oauth2Service.goToProfilePage();
  }
  //   settings():void{
  //    this._router.navigate(['/settings']);
  // }
  logout(): void {
    this.oauth2Service.logout();
  }

  editProfile(): void {
    this.oauth2Service.goToProfilePage();
  }
  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  toggleThemeMode() {
    this.themeService.theme.update((theme) => {
      const mode = !this.themeService.isDark ? 'dark' : 'light';
      return { ...theme, mode: mode };
    });
  }

  toggleThemeColor(color: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, color: color };
    });
  }

  setDirection(value: string) {
    this.themeService.theme.update((theme) => {
      return { ...theme, direction: value };
    });
  }
}
