import { ParticipantResponse } from "./ParticipantResponse";
import { SalleResponse } from "./SalleResponse";

export interface MeetingResponse {
  id: number;
  publicId: string;
  createdDate: string;
  createdBy: number;
  subject: string;
  description: string;
  dateMeeting: string;
  lastModifiedDate: string;
  lastModifiedBy: number;
  participants: ParticipantResponse[];
  salle: SalleResponse;
}