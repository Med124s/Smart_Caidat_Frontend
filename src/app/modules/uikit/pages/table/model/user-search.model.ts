import { Pagination } from "src/app/shared/models/request.model";
import { RegisterUser } from "src/app/shared/models/user.model";

export interface SearchQuery {
  query: string,
  page: Pagination
}

export interface SearchResponse {
  users: RegisterUser[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}