import { DatePipe } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import dayjs from 'dayjs';
import { Citizen } from 'src/app/modules/citoyen/model/citoyen.model';
import { CitizenSelectionService } from '../../services/citoyen-selection.service';

@Component({
  selector: '[app-citizen-table-row]',
  imports: [FormsModule, AngularSvgIconModule,DatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TablecitizenRowComponent implements OnChanges {
  @Input() citizen: Citizen = {};
  @Input() citizenIds: string[] = [];
  avatarPreview: string | ArrayBuffer | null = null;
  isSelected: boolean = false;
  // citoyenService = inject(citoyenSearchService);
  selectionService = inject(CitizenSelectionService);

ngOnChanges(changes: SimpleChanges): void {
  if (changes['citizen'] && this.citizen) {
    if (this.citizen.imageUrl) {
      // Si l'URL est une URL locale relative (uploadée via Spring Boot)
      if (this.citizen.imageUrl.startsWith('/uploads/')) {
        this.avatarPreview = 'http://localhost:8080' + this.citizen.imageUrl;
      } else {
        // Sinon, c’est probablement une URL absolue déjà prête
        this.avatarPreview = this.citizen.imageUrl;
      }
    } else {
      // Si aucune image, utiliser une image par défaut générée
      const name = `${this.citizen.firstName ?? ''}+${this.citizen.lastName ?? ''}`;
      this.avatarPreview = `https://ui-avatars.com/api/?name=${name}&background=random`;
    }
  }
}

  selectedCitoyens: Set<string> = new Set();

  toggleSelection(event: MouseEvent) {
    event.stopPropagation();
    if (this.citizen.publicId) {
      this.selectionService.toggleSelection(this.citizen.publicId);
    }
  }

  formatLastSeen(value?: any): string {
    if (!value) return '';
    return dayjs(value).format('DD/MM/YYYY HH:mm');
  }
}
