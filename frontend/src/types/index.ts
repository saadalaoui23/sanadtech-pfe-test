export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
  page: number;
}

export interface AlphabetStats {
  [letter: string]: {
    count: number;
    start: number; 
  };
}

export interface SearchResponse {
  users: User[];
  total: number;
  hasMore: boolean;
  page: number;
}


export type APIResponse = PaginatedUsersResponse | SearchResponse;