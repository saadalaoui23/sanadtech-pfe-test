import axios from 'axios';
import type { PaginatedUsersResponse, AlphabetStats, SearchResponse } from '../types';

// --- MODIFICATION MAGIQUE POUR LA PORTABILITÉ ---
const getBaseUrl = () => {
  // Si on est dans le navigateur
  if (typeof window !== 'undefined') {
    // On récupère l'adresse actuelle (ex: "localhost" ou "127.0.0.1" ou "192.168.x.x")
    const hostname = window.location.hostname;
    // On suppose que l'API est toujours sur le port 3000 du même serveur
    return `http://${hostname}:3000/api`;
  }
  // Fallback par défaut
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseUrl();
// ------------------------------------------------

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const fetchPaginatedUsers = async (
  page: number = 1,
  limit: number = 50,
  letter?: string,
  search?: string
): Promise<PaginatedUsersResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (letter) params.letter = letter;
  if (search) params.search = search;

  // Note: J'ai retiré le "/users" ici car il est souvent source d'erreur 
  // si l'URL de base contient déjà /api/users. 
  // Avec ma config, l'appel sera : http://[IP]:3000/api/users/paginated
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
  const response = await apiClient.get<SearchResponse>('/users/search', { params });
  return response.data;
};

export const jumpToLetter = async (letter: string, limit: number = 50): Promise<PaginatedUsersResponse> => {
  return fetchPaginatedUsers(1, limit, letter);
};