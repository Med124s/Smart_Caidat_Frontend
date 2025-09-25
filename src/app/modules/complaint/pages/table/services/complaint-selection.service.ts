import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ComplaintSelectionService {
   private selectedComplaintSubject = new BehaviorSubject<Set<string>>(new Set());
  selectedcomplaint$ = this.selectedComplaintSubject.asObservable();

  toggleSelection(complaintId: string) {

    const current = new Set(this.selectedComplaintSubject.value);
    if (current.has(complaintId)) current.delete(complaintId);
    else current.add(complaintId);

    console.log(current);
    
    this.selectedComplaintSubject.next(current);
  }

  selectAll(complaintIds: string[]) {
    console.log("SELECTION SERVICE ------------");
    console.log(complaintIds);
    
    this.selectedComplaintSubject.next(new Set(complaintIds));
  }

  isSelected(complaintId: string): boolean {
    return this.selectedComplaintSubject.value.has(complaintId);
  }

  clearSelection() {
    this.selectedComplaintSubject.next(new Set());
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedComplaintSubject.value);
  }

    /** 🔥 Retourne les IDs sélectionnés pour suppression */
  deleteSelected(): string[] {
    const selected = this.getSelectedIds();
    this.clearSelection(); // vide après suppression
    return selected;
  }
}
