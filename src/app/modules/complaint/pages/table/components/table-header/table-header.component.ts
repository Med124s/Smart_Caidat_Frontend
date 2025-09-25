import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ConnectedUser } from 'src/app/shared/models/user.model';
import { State } from 'src/app/shared/models/state.model';
import { Oauth2AuthService } from 'src/app/modules/auth/oauth2-auth.service';
import { ComplaintSelectionService } from '../../services/complaint-selection.service';

@Component({
  selector: '[app-complaints-table-header]',
  imports: [AngularSvgIconModule],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.css',
})
export class TableComplaintsHeaderComponent implements OnInit {
  @Input() complaintsIds: any[] = [];
  @Output() onCheck = new EventEmitter<boolean>();
  oauth2Auth = inject(Oauth2AuthService);

  /** Observable qui renvoie true si tout est sélectionné */
  // isAllSelected$!: Observable<boolean>;
  private selectionService = inject(ComplaintSelectionService);

  canChangeStatus = false;

  currentUser: ConnectedUser | null = null;
  ngOnInit() {
    const state: State<ConnectedUser> = this.oauth2Auth.fetchUser();

    if (state.status === 'OK' && state.value) {
      this.currentUser = state.value;
    }
    this.canChangeStatus = this.currentUser?.authorities?.includes('ROLE_ADMIN') ?? false;
  }

  toggleAllSelection(event: any) {
    const checked = event.target.checked;

    console.log('is checked');
    console.log(checked);

    if (checked) {
      console.log('selection ids::');
      this.selectionService.selectAll(this.complaintsIds);
    } else this.selectionService.clearSelection();
    this.onCheck.emit(checked);
  }

  isAllSelected(): boolean {
    return this.complaintsIds.length > 0 && this.complaintsIds.every((id) => this.selectionService.isSelected(id));
  }
}
