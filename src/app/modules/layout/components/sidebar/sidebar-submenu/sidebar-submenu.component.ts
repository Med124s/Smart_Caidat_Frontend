import { NgClass, NgFor, NgTemplateOutlet, NgIf } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SubMenuItem } from 'src/app/core/models/menu.model';
import { MenuService } from '../../../services/menu.service';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { NotificationService } from 'src/app/modules/documents_managements/request/pages/table/services/notification-service';

@Component({
  selector: 'app-sidebar-submenu',
  templateUrl: './sidebar-submenu.component.html',
  styleUrls: ['./sidebar-submenu.component.css'],
  imports: [NgClass, NgFor, NgTemplateOutlet, RouterLinkActive, RouterLink, AngularSvgIconModule, NgIf],
})
export class SidebarSubmenuComponent implements OnInit {
  @Input() public submenu = <SubMenuItem>{};

  pendingCount: number = 0;
  currentUser: ConnectedUser | null = null;
  oauth2Auth = inject(Oauth2AuthService);
  notificationService = inject(NotificationService);
  isAdmin = false;
  constructor(public menuService: MenuService) {}

  // ngOnInit() {
  //   const state = this.oauth2Auth.fetchUser();
  //   if (state.status === 'OK' && state.value) {
  //     this.currentUser = state.value;
  //     if (this.currentUser.authorities?.includes('ROLE_ADMIN')) {
  //       // this.loadPendingCount();
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

  public toggleMenu(menu: any) {
    this.menuService.toggleSubMenu(menu);
  }

  private collapse(items: Array<any>) {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children) this.collapse(item.children);
    });
  }
}
