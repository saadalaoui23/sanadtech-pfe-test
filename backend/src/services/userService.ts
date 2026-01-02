import { User, GetUsersParams, PaginatedUsersResponse, SearchResponse } from '../types';
import * as indexService from './indexService';
import { readUsersFromFile, searchUsersInFile } from '../utils/dataProcessor'; // ✅ Import de la fonction Stream
import * as path from 'path';
import { getCachedUsers, setCachedUsers, generateCacheKey } from '../utils/cache';

const USERS_FILE = path.join(__dirname, '../../data/users.txt');

/**
 * Retrieves paginated users with optional filtering by letter
 */
export const getUsers = async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
  try {
    const { page, limit, letter, search } = params;

    // Check cache first
    const cacheKey = generateCacheKey(page, limit, letter, search);
    const cached = getCachedUsers(cacheKey);
    if (cached) {
      return cached;
    }

    let startIndex = 0;
    let endIndex = 0;

    if (letter) {
      // Use alphabetical index
      const indexData = await indexService.getIndexForLetter(letter);
      if (!indexData) {
        return { users: [], hasMore: false, total: 0, page };
      }
      startIndex = indexData.start;
      endIndex = indexData.end;
    } else {
      // Use full range
      const stats = await indexService.getFullStats();
      startIndex = 0;
      endIndex = stats.total;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const actualStart = startIndex + skip;
    const actualEnd = Math.min(actualStart + limit, endIndex);

    // Read users from file
    const users = await readUsersFromFile(USERS_FILE, actualStart, actualEnd);

    // Note: Le filtrage 'search' ici s'applique uniquement à la page courante (legacy behavior).
    // Pour une vraie recherche globale, utilisez l'endpoint /search qui appelle searchUsers() ci-dessous.
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = actualEnd < endIndex && filteredUsers.length > 0;

    const result: PaginatedUsersResponse = {
      users: filteredUsers,
      hasMore,
      total: endIndex - startIndex,
      page,
    };

    // Cache the result
    setCachedUsers(cacheKey, result);

    return result;
  } catch (error: any) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

export const getUsersByLetter = async (letter: string, limit: number = 100): Promise<PaginatedUsersResponse> => {
  return getUsers({ page: 1, limit, letter });
};

/**
 * Searches for users matching a query string using STREAMING (Scalable 10M+)
 */
export const searchUsers = async (query: string, limit: number, page: number = 1): Promise<SearchResponse> => {
  try {
    if (!query || query.trim().length === 0) {
      return { users: [], total: 0, hasMore: false, page };
    }

    // ✅ APPEL DE LA NOUVELLE FONCTION STREAMÉE
    // Elle lit le fichier ligne par ligne et s'arrête dès qu'elle a rempli la page.
    const { users, hasMore, totalMatches } = await searchUsersInFile(USERS_FILE, query, page, limit);

    return {
      users,
      total: totalMatches, // Total estimé si hasMore est vrai, sinon total exact trouvé
      hasMore,
      page
    };
  } catch (error: any) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const users = await readUsersFromFile(USERS_FILE, 0, Math.min(id + 100, 1000));
    return users.find((user) => user.id === id) || null;
  } catch (error: any) {
    throw new Error(`Failed to get user by id: ${error.message}`);
  }
};