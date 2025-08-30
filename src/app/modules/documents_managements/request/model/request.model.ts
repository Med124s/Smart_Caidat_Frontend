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
  motif?: string;
  citizenPublicId?: string;
  creatorPublicId?: string;
  validatorPublicId?: string;
  citizen?:{firstname:string,lastName:string, publicId:string}
  creationDate?:Date | string;
  documentUrl:string;
  creator?: {lastName:string, firstname:string, publicId:string};
  status:RequestStatus;
  validationDate?: Date | string;
}
