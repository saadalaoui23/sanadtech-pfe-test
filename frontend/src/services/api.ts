import axios from 'axios';
import type { PaginatedUsersResponse, AlphabetStats, SearchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const fetchPaginatedUsers = async (
  page: number = 1,
  limit: number = 50,
  letter?: string,
  search?: string // Le backend supporte search ici aussi maintenant
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (letter) params.letter = letter;
  if (search) params.search = search;

  const response = await apiClient.get<PaginatedUsersResponse>('/users/paginated', { params });
  return response.data;
};

export const fetchAlphabetStats = async (): Promise<AlphabetStats> => {
  const response = await apiClient.get<AlphabetStats>('/users/alphabet-stats');
  return response.data;
};

export const searchUsers = async (
  query: string, 
  limit: number = 50, 
  page: number = 1 
): Promise<SearchResponse> => {
  const params = {
    q: query,
    limit: limit.toString(),
    page: page.toString(),
  };
  // Note: Votre backend optimisé utilise maintenant ILIKE/Trigrammes ici
  const response = await apiClient.get<SearchResponse>('/users/search', { params });
  return response.data;
};


// Si vous l'utilisez quelque part, faites-la pointer vers fetchPaginatedUsers
export const jumpToLetter = async (letter: string, limit: number = 50): Promise<PaginatedUsersResponse> => {
  return fetchPaginatedUsers(1, limit, letter);
};