export enum Gender { 'MALE', 'FEMALE' }
export enum MaritalStatus { 'DIVORCED' , 'MARRIED' , 'SINGLE', 'WIDOWER'}



export interface Citizen {
  firstName?: string;
  lastName?: string;
  cin?: string;
  idcs?: string;
  phone?: string;
  address?: string;
  maritalStatus?: MaritalStatus;
  dateBirth?: Date | string; // ← utile si ça vient en string du backend
  gender?: Gender;
  email?: string;
  imageUrl?: string;
  publicId?: string;
  selected?: boolean;
}
