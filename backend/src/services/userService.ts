import { User, GetUsersParams, PaginatedUsersResponse, SearchResponse } from '../types';
import * as indexService from './indexService';
import { readUsersFromFile, binarySearchUsers } from '../utils/dataProcessor';
import * as path from 'path';
import { getCachedUsers, setCachedUsers, generateCacheKey } from '../utils/cache';

const USERS_FILE = path.join(__dirname, '../../data/users.txt');

/**
 * Retrieves paginated users with optional filtering by letter
 * Uses caching to improve performance for frequently requested pages
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

    // Filter by search term if provided
    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = actualEnd < endIndex && filteredUsers.length === limit;

    const result: PaginatedUsersResponse = {
      users: filteredUsers,
      hasMore,
      total: endIndex - startIndex,
      page,
    };

    // Cache the result
    setCachedUsers(cacheKey, result);

    return result;
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

/**
 * Retrieves users starting with a specific letter (for jump-to-letter functionality)
 */
export const getUsersByLetter = async (letter: string, limit: number = 100): Promise<PaginatedUsersResponse> => {
  return getUsers({ page: 1, limit, letter });
};

/**
 * Searches for users matching a query string
 * Uses binary search for better performance
 */
export const searchUsers = async (query: string, maxResults: number = 100): Promise<SearchResponse> => {
  try {
    if (!query || query.trim().length === 0) {
      return { users: [], positions: [], total: 0 };
    }

    const { users, positions } = await binarySearchUsers(USERS_FILE, query.trim(), maxResults);

    return {
      users,
      positions,
      total: users.length,
    };
  } catch (error) {
    throw new Error(`Failed to search users: ${error.message}`);
  }
};

/**
 * Retrieves a user by ID (not optimized for large datasets)
 * For production, would need an ID index
 */
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    // This is not optimized - would need an ID index for production
    // For now, limit search to first 1000 users
    const users = await readUsersFromFile(USERS_FILE, 0, Math.min(id + 100, 1000));
    return users.find((user) => user.id === id) || null;
  } catch (error) {
    throw new Error(`Failed to get user by id: ${error.message}`);
  }
};
