export interface User {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string; // Ajouté par sécurité si vous avez des images
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
  total: number;
  // --- NOUVEAUX CHAMPS REQUIS POUR LE SCROLL INFINI ---
  hasMore: boolean; 
  page: number;
  // ----------------------------------------------------
  positions?: number[]; // Devenu optionnel
}

// Type union pour le hook useUserData
export type APIResponse = PaginatedUsersResponse | SearchResponse;