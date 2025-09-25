import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestSelectionService {
   private selectedRequestSubject = new BehaviorSubject<Set<string>>(new Set());
  selectedRequest$ = this.selectedRequestSubject.asObservable();

  toggleSelection(requestId: string) {

    const current = new Set(this.selectedRequestSubject.value);
    if (current.has(requestId)) current.delete(requestId);
    else current.add(requestId);

    console.log(current);
    
    this.selectedRequestSubject.next(current);
  }

  selectAll(requestIds: string[]) {
    console.log("SELECTION SERVICE ------------");
    console.log(requestIds);
    
    this.selectedRequestSubject.next(new Set(requestIds));
  }

  isSelected(requestId: string): boolean {
    return this.selectedRequestSubject.value.has(requestId);
  }

  clearSelection() {
    this.selectedRequestSubject.next(new Set());
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedRequestSubject.value);
  }

    /** 🔥 Retourne les IDs sélectionnés pour suppression */
  deleteSelected(): string[] {
    const selected = this.getSelectedIds();
    this.clearSelection(); // vide après suppression
    return selected;
  }

  // private selectedCitizensSubject = new BehaviorSubject<Set<string>>(new Set());
  // selectedUsers$ = this.selectedCitizensSubject.asObservable();

  // toggleSelection(requestsId: string) {
  //   const current = new Set(this.selectedCitizensSubject.value);
  //   if (current.has(requestsId)) current.delete(requestsId);
  //   else current.add(requestsId);
  //   this.selectedCitizensSubject.next(current);
  // }

  // selectAll(requestsId: string[]) {

  //   this.selectedCitizensSubject.next(new Set(requestsId));
  // }

  // isSelected(requestsId: string): boolean {
  //   return this.selectedCitizensSubject.value.has(requestsId);
  // }

  // clearSelection() {
  //   this.selectedCitizensSubject.next(new Set());
  // }

  // getSelectedIds(): string[] {
  //   return Array.from(this.selectedCitizensSubject.value);
  // }
}
