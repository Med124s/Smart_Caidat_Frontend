export interface TaskRequest {
  descriptionCreation?: string;
  descriptionUpdate?: string;
  title?: string;
  status?: string;
  dateFin?: string;
  idAffected?: number;
  dateDebut?: string;
  rapport?: string | null;
  lastModifiedBy?: number;
  createdBy?: number;
}