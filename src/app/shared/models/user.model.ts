import {Dayjs} from "dayjs";

export interface BaseUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  // password?:string,
  // confirmPassword?:string,
  imageUrl?: string;
  publicId?: string;
  lastSeen?: Dayjs;
  selected?:boolean
}

export interface ConnectedUser extends BaseUser {
  authorities?: string[];
}
export interface RegisterUser extends BaseUser {
  authorities?: string[];
  password?:string,
  confirmPassword?:string,
}
