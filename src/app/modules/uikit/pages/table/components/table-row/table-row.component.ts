import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RegisterUser } from 'src/app/shared/models/user.model';
import { UserSearchService } from '../../services/user-search.service';
import { UserSelectionService } from '../../services/user-selection.service';
import dayjs from 'dayjs';
import { JsonPipe } from '@angular/common';

@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, JsonPipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent implements OnChanges {
  @Input() user: RegisterUser | any = {};
  @Input() userIds: string[] = [];
  @Output() detailUser = new EventEmitter<any>();
  @Output() onUpdateUser = new EventEmitter<any>();

  avatarPreview: string | ArrayBuffer | null = null;
  isSelected: boolean = false;
  userService = inject(UserSearchService);
  selectionService = inject(UserSelectionService);

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['user'] && this.user != null) {
  //     if (this.file != null) {
  //       const reader = new FileReader();
  //       reader.onload = () => {
  //         this.avatarPreview = reader.result;
  //       };

  //       reader.readAsDataURL(this.userInfo.file);
  //     } else {
  //       // fallback image (ui-avatar or anything else)
  //       this.avatarPreview = `https://ui-avatars.com/api/?name=${this.userInfo.user.firstName}&background=random`;
  //     }

  //   }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      if (this.user.imageUrl) {
        if (this.user.imageUrl.startsWith('/uploads/')) {
          this.avatarPreview = 'http://localhost:8080' + this.user.imageUrl;
        } else {
          this.avatarPreview = this.user.imageUrl;
        }
      } else {
        this.avatarPreview = `https://ui-avatars.com/api/?name=${this.user.firstName}&background=random`;
      }
    }
  }
  selectedUsers: Set<string> = new Set();

  toggleSelection(event: MouseEvent) {
    event.stopPropagation();
    if (this.user.publicId) {
      this.selectionService.toggleSelection(this.user.publicId);
    }
  }

  formatLastSeen(value?: any): string {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  }



  showUser(user: any) {
    console.log('______________show user');
    console.log(user);

    this.detailUser.emit(user);
  }

  updateUser(user: any) {
    console.log('Update user   __ row');
    console.log(user);
    this.onUpdateUser.emit(user);
  }
}
