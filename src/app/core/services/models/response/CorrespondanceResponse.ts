import { TypeResponse } from "./TypeResponse";

export interface CorrespondanceResponse {
    id: number;
    publicId: string;
    subject: string;
    description: string;
    dateReception: string;
    sender: string;
    recipient: string;
    reference: string;
    createdDate: string;
    lastModifiedDate: string;
    createdBy: number;
    lastModifiedBy: number;
    typeCorrespondance: TypeResponse;
}