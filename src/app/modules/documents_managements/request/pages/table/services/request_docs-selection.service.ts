import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestSelectionService {
  private selectedCitizensSubject = new BehaviorSubject<Set<string>>(new Set());
  selectedUsers$ = this.selectedCitizensSubject.asObservable();

  toggleSelection(citizenId: string) {
    const current = new Set(this.selectedCitizensSubject.value);
    if (current.has(citizenId)) current.delete(citizenId);
    else current.add(citizenId);
    this.selectedCitizensSubject.next(current);
  }

  selectAll(citizenIds: string[]) {
    
    this.selectedCitizensSubject.next(new Set(citizenIds));
  }

  isSelected(citizenId: string): boolean {
    return this.selectedCitizensSubject.value.has(citizenId);
  }

  clearSelection() {
    this.selectedCitizensSubject.next(new Set());
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedCitizensSubject.value);
  }
}
