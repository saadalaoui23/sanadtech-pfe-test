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

export interface SearchResponse {
  users: User[];
  total: number;
  hasMore: boolean; 
  page: number;
  // 'positions' supprimé car inutile en SQL
}

// Format attendu par le Frontend pour le menu alphabétique
export interface AlphabetStats {
  [letter: string]: {
    count: number;
    start: number; // On garde 'start' pour la compatibilité front
  };
}

export interface GetUsersParams {
  page: number;
  limit: number;
  letter?: string;
  search?: string;
}