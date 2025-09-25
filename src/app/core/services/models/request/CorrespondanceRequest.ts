export interface CorrespondanceRequest {
  subject: string;
  id?: number;
  description: string;
  sender: string;
  reference: string;
  recipient: string;
  dateReception: string;
  typeId: number;
  lastModifiedBy?: number;
  createdBy?: number;
}