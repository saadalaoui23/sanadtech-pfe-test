import { User, GetUsersParams, PaginatedUsersResponse, SearchResponse } from '../types';
import * as indexService from './indexService';
import { readUsersFromFile } from '../utils/dataProcessor';
import * as path from 'path';
import { getCachedUsers, setCachedUsers, generateCacheKey } from '../utils/cache';

const USERS_FILE = path.join(__dirname, '../../data/users.txt');

/**
 * Retrieves paginated users with optional filtering by letter
 */
export const getUsers = async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
  try {
    const { page, limit, letter, search } = params;

    const cacheKey = generateCacheKey(page, limit, letter, search);
    const cached = getCachedUsers(cacheKey);
    if (cached) {
      return cached;
    }

    let startIndex = 0;
    let endIndex = 0;

    if (letter) {
      const indexData = await indexService.getIndexForLetter(letter);
      if (!indexData) {
        return { users: [], hasMore: false, total: 0, page };
      }
      startIndex = indexData.start;
      endIndex = indexData.end;
    } else {
      const stats = await indexService.getFullStats();
      startIndex = 0;
      endIndex = stats.total;
    }

    const skip = (page - 1) * limit;
    const actualStart = startIndex + skip;
    const actualEnd = Math.min(actualStart + limit, endIndex);

    const users = await readUsersFromFile(USERS_FILE, actualStart, actualEnd);

    // Note: Si 'search' est utilisé ici, le filtrage est appliqué après la pagination du fichier,
    // ce qui n'est pas idéal mais conservé pour compatibilité avec votre logique actuelle.
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
 * Searches for users matching a query string with proper pagination
 */
export const searchUsers = async (query: string, limit: number, page: number = 1): Promise<any> => {
  try {
    if (!query || query.trim().length === 0) {
      return { users: [], total: 0, hasMore: false };
    }

    const searchLower = query.toLowerCase().trim();

    // Pour garantir une recherche correcte avec pagination, on lit une large plage
    // et on filtre en mémoire. Pour 10M, l'idéal serait un index dédié (ex: ElasticSearch),
    // mais ici on adapte l'existant.
    
    // On lit tout le fichier (ou une très grande partie) pour filtrer
    // Note: dataProcessor devrait idéalement supporter un callback de stream pour éviter la RAM excessive
    const allUsers = await readUsersFromFile(USERS_FILE, 0, Infinity); 
    
    const matchingUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower)
    );

    // Calcul de la pagination manuelle
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedUsers = matchingUsers.slice(startIndex, endIndex);
    const hasMore = endIndex < matchingUsers.length;

    return {
      users: paginatedUsers,
      total: matchingUsers.length,
      hasMore: hasMore, // Information cruciale pour le frontend
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