export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  [key: string]: any; // Flexibilité pour d'autres champs éventuels
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
  page: number;
}

// ⚠️ CORRECTION ICI : 'startIndex' devient 'start' pour matcher le Backend
export interface AlphabetStats {
  [letter: string]: {
    count: number;
    start: number; // Le backend renvoie "start", pas "startIndex"
    end?: number;  // Le backend renvoie souvent "end" aussi
  };
}

export interface SearchResponse {
  users: User[];
  total: number;
  // --- C'EST PARFAIT POUR LE SCROLL INFINI ---
  hasMore: boolean; 
  page: number;
  // -------------------------------------------
  positions?: number[];
}

// Type union utile pour les hooks
export type APIResponse = PaginatedUsersResponse | SearchResponse;