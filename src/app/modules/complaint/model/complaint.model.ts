export enum ComplaintType {
  ADMINISTRATIVE = 'ADMINISTRATIVE',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  SANITATION = 'SANITATION',
  SECURITY = 'SECURITY',
  OTHER = 'OTHER',
}

/** Statut d’une réclamation */
export enum ComplaintStatus {
  OPEN = 'OPEN', // créée, non traitée
  IN_PROGRESS = 'IN_PROGRESS', // en cours de traitement
  RESOLVED = 'RESOLVED', // résolue (solution apportée)
  REJECTED = 'REJECTED', // rejetée (non recevable, etc.)
}

export interface CitizenMini {
  publicId: string;
  cin?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

/** Priorité */
export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface UserMini {
  publicId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface Attachment {
  id?: string;
  publicId?: string;
  fileName: string;
  fileTitle?: string;
  mimeType?: string;
  file?: File; // <-- ici le vrai fichier
}

export interface Complaint {
  publicId?: string;
  title: string;
  type?: ComplaintType;
  description?: string;
  citizen?: CitizenMini;
  assignedTo?: UserMini;
  createdBy?: UserMini;
  priority: ComplaintPriority;
  status?: ComplaintStatus;
  reason?: string;
  creationDate?: Date | string;
  validationDate?: Date | string;
}

/** DTO création (ce que tu envoies au backend pour créer) */
export interface CreateComplaintDTO {
  title: string;
  description?: string;
  type: ComplaintType;
  priority?: ComplaintPriority; // défaut MEDIUM côté backend
  citizenPublicId: string;
}

/** DTO update “informatif” (PUT/PATCH) */
export interface UpdateComplaintDTO {
  publicId: string;
  title?: string;
  description?: string;
  type?: ComplaintType;
  priority?: ComplaintPriority;
  status?: ComplaintStatus;
  assignedToPublicId?: string | null;
}

/** Changement de statut (action ciblée) */
export interface UpdateStatusDTO {
  publicId: string;
  status: ComplaintStatus;
  reason?: string;
}

/** Filtres de la table (UI) */
export interface ComplaintFilters {
  q?: string; // texte global (titre/desc/CIN)
  type?: ComplaintType | '';
  status?: ComplaintStatus | '';
  priority?: ComplaintPriority | '';
  citizenCin?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  onlyMine?: boolean; // si true, seulement celles de l’utilisateur
}
/** Utilitaire: libellés pour affichage */
export const ComplaintStatusLabel: Record<ComplaintStatus, string> = {
  [ComplaintStatus.OPEN]: 'Ouverte',
  [ComplaintStatus.IN_PROGRESS]: 'En cours',
  [ComplaintStatus.RESOLVED]: 'Résolue',
  [ComplaintStatus.REJECTED]: 'Rejetée',
};

export const ComplaintPriorityLabel: Record<ComplaintPriority, string> = {
  [ComplaintPriority.LOW]: 'Basse',
  [ComplaintPriority.MEDIUM]: 'Moyenne',
  [ComplaintPriority.HIGH]: 'Élevée',
  [ComplaintPriority.URGENT]: 'Urgente',
};
export const ComplaintTypeLabel: Record<ComplaintType, string> = {
  [ComplaintType.ADMINISTRATIVE]: 'Administrative',
  [ComplaintType.INFRASTRUCTURE]: 'Infrastructure',
  [ComplaintType.SANITATION]: 'Assainissement',
  [ComplaintType.SECURITY]: 'Sécurité',
  [ComplaintType.OTHER]: 'Autre',
};
