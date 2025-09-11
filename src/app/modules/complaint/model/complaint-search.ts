import { Pagination } from "src/app/shared/models/request.model";

export interface SearchQuery {
  query: string,
  page: Pagination
}

export interface SearchResponse<T> {
  data: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}