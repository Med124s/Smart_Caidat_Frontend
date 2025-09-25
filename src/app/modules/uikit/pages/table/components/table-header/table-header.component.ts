import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UserSelectionService } from '../../services/user-selection.service';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { State } from 'src/app/shared/models/state.model';

@Component({
  selector: '[app-table-header]',
  imports: [AngularSvgIconModule],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.css',
})
export class TableHeaderComponent implements OnInit {
  // @Input() userIds: string[] = [];
  // @Output() onCheck = new EventEmitter<boolean>();

  // public toggle(event: Event) {
  //   const checked = (event.target as HTMLInputElement).checked;
  //   this.onCheck.emit(checked); // émet au parent : true/false
  // }


    @Input() userIds: any[] = [];
  @Output() onCheck = new EventEmitter<boolean>();
  oauth2Auth = inject(Oauth2AuthService);

  /** Observable qui renvoie true si tout est sélectionné */
  // isAllSelected$!: Observable<boolean>;
  private selectionService = inject(UserSelectionService);

  canChangeStatus = false;

  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    // const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();

    // if (state.status === 'OK' && state.value) {
    //   this.currentUser = state.value;
    // }
    // this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;

    console.log('is checked');
    console.log(checked);

    if (checked) {
      console.log('selection ids::');
      this.selectionService.selectAll(this.userIds);
    } else this.selectionService.clearSelection();
    this.onCheck.emit(checked);
  }

  isAllSelected(): boolean {
    return this.userIds.length > 0 && this.userIds.every((id) => this.selectionService.isSelected(id));
  }



}
