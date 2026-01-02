import axios from 'axios';
import type { PaginatedUsersResponse, AlphabetStats, SearchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

/**
 * Fetches paginated users with optional filtering
 */
export const fetchPaginatedUsers = async (
  page: number = 1,
  limit: number = 50,
  letter?: string,
  search?: string
): Promise<PaginatedUsersResponse> => {
  // Construction propre des paramètres
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (letter) params.letter = letter;
  // Note: search n'est généralement pas envoyé ici si searchUsers existe, 
  // mais on le laisse si votre backend le supporte via getPaginatedUsers
  if (search) params.search = search; 

  const response = await apiClient.get<PaginatedUsersResponse>('/users/paginated', { params });
  return response.data;
};

/**
 * Fetches alphabet statistics for navigation menu
 */
export const fetchAlphabetStats = async (): Promise<AlphabetStats> => {
  const response = await apiClient.get<AlphabetStats>('/users/alphabet-stats');
  return response.data;
};

/**
 * Searches for users matching a query with pagination
 */
export const searchUsers = async (
  query: string, 
  limit: number = 50, 
  page: number = 1 // Ajout paramètre page
): Promise<SearchResponse> => {
  const params = {
    q: query,
    limit: limit.toString(),
    page: page.toString(), // On envoie la page au backend
  };

  const response = await apiClient.get<SearchResponse>('/users/search', { params });
  return response.data;
};

/**
 * Jumps to a specific letter in the user list
 */
export const jumpToLetter = async (letter: string, limit: number = 50): Promise<PaginatedUsersResponse> => {
  const params = {
    limit: limit.toString(),
  };

  const response = await apiClient.get<PaginatedUsersResponse>(
    `/users/jump-to-letter/${letter}`, { params }
  );
  return response.data;
};