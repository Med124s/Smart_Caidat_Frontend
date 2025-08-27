import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ArchiveSelectionService {
  private selectedArchivesSubject = new BehaviorSubject<Set<string>>(new Set());
  selectedArchives$ = this.selectedArchivesSubject.asObservable();

  toggleSelection(archiveId: string) {


    const current = new Set(this.selectedArchivesSubject.value);
    if (current.has(archiveId)) current.delete(archiveId);
    else current.add(archiveId);
    this.selectedArchivesSubject.next(current);
  }

  selectAll(archiveIds: string[]) {
    console.log("SELECTION SERVICE ------------");
    console.log(archiveIds);
    
    this.selectedArchivesSubject.next(new Set(archiveIds));
  }

  isSelected(archiveId: string): boolean {
    return this.selectedArchivesSubject.value.has(archiveId);
  }

  clearSelection() {
    this.selectedArchivesSubject.next(new Set());
  }

  getSelectedIds(): string[] {
    return Array.from(this.selectedArchivesSubject.value);
  }

    /** 🔥 Retourne les IDs sélectionnés pour suppression */
  deleteSelected(): string[] {
    const selected = this.getSelectedIds();
    this.clearSelection(); // vide après suppression
    return selected;
  }
}
