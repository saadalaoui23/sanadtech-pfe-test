import axios from 'axios';
import { PaginatedUsersResponse, AlphabetStats, SearchResponse } from '../types';

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
  limit: number = 100,
  letter?: string,
  search?: string
): Promise<PaginatedUsersResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (letter) {
    params.append('letter', letter);
  }

  if (search) {
    params.append('search', search);
  }

  const response = await apiClient.get<PaginatedUsersResponse>(`/users/paginated?${params.toString()}`);
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
 * Searches for users matching a query
 */
export const searchUsers = async (query: string, maxResults: number = 100): Promise<SearchResponse> => {
  const params = new URLSearchParams({
    q: query,
    maxResults: maxResults.toString(),
  });

  const response = await apiClient.get<SearchResponse>(`/users/search?${params.toString()}`);
  return response.data;
};

/**
 * Jumps to a specific letter in the user list
 */
export const jumpToLetter = async (letter: string, limit: number = 100): Promise<PaginatedUsersResponse> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  const response = await apiClient.get<PaginatedUsersResponse>(
    `/users/jump-to-letter/${letter}?${params.toString()}`
  );
  return response.data;
};
