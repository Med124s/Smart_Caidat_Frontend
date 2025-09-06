export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum RequestType {
  CERTIFICAT_VIE = 'CERTIFICAT_VIE',
  CERTIFICAT_MARITAL = 'CERTIFICAT_MARITAL',
  CERTIFICAT_RESIDENCE = 'CERTIFICAT_RESIDENCE',
  CERTIFICAT_DECES = 'CERTIFICAT DECES',
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
  citizenCin?:string;
  creatorFullName?:string;
  creationDate?:Date | string;
  otherType?:string;
  documentUrl:string | null;
  creator?: {lastName:string, firstname:string, publicId:string};
  status?:RequestStatus | any;
  validationDate?: Date | string;
}
