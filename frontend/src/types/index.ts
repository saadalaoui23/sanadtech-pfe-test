export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
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
    startIndex: number;
  };
}

export interface SearchResponse {
  users: User[];
  positions: number[];
  total: number;
}
