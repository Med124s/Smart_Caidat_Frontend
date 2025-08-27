export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RequestType {
  CERTIFICAT_VIE = 'CERTIFICAT_VIE',
  CERTIFICAT_MARITAL = 'CERTIFICAT_MARITAL',
  CERTIFICAT_RESIDENCE = 'CERTIFICAT_RESIDENCE',
  CIN = 'CIN',
  PASSPORT = 'PASSPORT',
  AUTRE = 'AUTRE'
}

export interface RequestDocument {
  publicId?:string;
  type: RequestType;
  description?: string;
  attachments?: string;
  motif?: string;
  citizenPublicId: string;
  creatorPublicId: string;
  validatorPublicId?: string;
  status:RequestStatus;
  trackingNumber?:string;
  creationDate?: Date | string
}
