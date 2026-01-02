export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AlphabetIndex {
  start: number;
  end: number;
  count: number;
}

export interface AlphabetStats {
  [letter: string]: {
    count: number;
    startIndex: number;
  };
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
  page: number;
}

export interface SearchResponse {
  users: User[];
  positions?: number[];
  total: number;
  hasMore: boolean; 
  page: number;
}

export interface FullStats {
  total: number;
}

export interface GetUsersParams {
  page: number;
  limit: number;
  letter?: string;
  search?: string;
}
