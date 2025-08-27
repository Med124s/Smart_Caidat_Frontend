export enum ArchiveType {
  DOCUMENT = "DOCUMENT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum ArchiveStatut {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
  ON_HOLD = "ON_HOLD",

}

export enum Confidentiality {
  PUBLIC = "PUBLIC",
  INTERNAL = "INTERNAL",
  CONFIDENTIAL = "CONFIDENTIAL",
}
export enum OwnerType {
  CITIZEN = "CITIZEN", // En attente de validation
  USER = "USER", // Validé / Approuvé
  NONE = "NONE", // Rejeté
}


export enum LieuStockage {
  LOCAL = "LOCAL",
  MINIO = "MINIO",
}


export interface Archive {
  id?: string;
  publicId?: string;
  title?: string;
  description?: string;
  categoryPublicId?: string;
  citizenPublicId?: string;
  categoryName?: string;
  ownerType?: OwnerType;
  ownerPublicId?: string;
  creationDate?: Date | string;
  lastModifiedDate?: Date | string;
  status?: ArchiveStatut;
  confidentiality?: Confidentiality;
  storageLocation?: LieuStockage;
  selected?:false;
  // 👇 لائحة الوثائق المرتبطة
  documents?: Document[];
}

export interface Document {
  id?: string;
  publicId?: string;
  fileName: string;
  fileTitle?: string;
  mimeType?: string;
  file?: File; // <-- ici le vrai fichier
}
