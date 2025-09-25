import { ParticipantRequest } from "./ParticipantRequest";

export interface MeetingRequest {
  subject?: string;
  id?: number;
  description?: string;
  dateMeeting?: string;
  timeMeeting?: string;
  participants?: ParticipantRequest[];
  salleId?: number;
  createdBy?: number;
  lastModifiedBy?: number;
}