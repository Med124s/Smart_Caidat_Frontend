import { AsyncPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from 'src/app/core/models/menu.model';
import { MenuService } from '../../../services/menu.service';
import { SidebarSubmenuComponent } from '../sidebar-submenu/sidebar-submenu.component';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { NotificationService } from 'src/app/modules/documents_managements/request/pages/table/services/notification-service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgFor,
    NgClass,
    AngularSvgIconModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    SidebarSubmenuComponent,
    AsyncPipe,
  ],
})
export class SidebarMenuComponent implements OnInit {
  pendingCount: number = 0;
  currentUser: ConnectedUser | null = null;
  oauth2Auth = inject(Oauth2AuthService);
  notificationService = inject(NotificationService);

  checkNotification = false;
  isAdmin = false;

  constructor(public menuService: MenuService) {}

  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }

  // ngOnInit() {
  //   const state = this.oauth2Auth.fetchUser();
  //   if (state.status === 'OK' && state.value) {
  //     this.currentUser = state.value;
  //     if (this.currentUser.authorities?.includes('ROLE_ADMIN')) {
  //       this.loadPendingCount();
  //     }
  //   }
  // }
  ngOnInit() {
    const state = this.oauth2Auth.fetchUser();
    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
      if (this.currentUser.authorities?.includes('ROLE_ADMIN')) {
        this.isAdmin = true;
      }
    }
    this.notificationService.pendingCount$.subscribe((count) => (this.pendingCount = count));
    this.notificationService.loadPendingCount();
  }
}
