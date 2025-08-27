import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserSelectionService {
  private selectedUsersSubject = new BehaviorSubject<Set<string>>(new Set());
  selectedUsers$ = this.selectedUsersSubject.asObservable();

  toggleSelection(userId: string) {
    const current = new Set(this.selectedUsersSubject.value);
    if (current.has(userId)) current.delete(userId);
    else current.add(userId);
    this.selectedUsersSubject.next(current);
  }

  selectAll(userIds: string[]) {
    this.selectedUsersSubject.next(new Set(userIds));
  }

  isSelected(userId: string): boolean {
    return this.selectedUsersSubject.value.has(userId);
  }

  clearSelection() {
    this.selectedUsersSubject.next(new Set());
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedUsersSubject.value);
  }
}
