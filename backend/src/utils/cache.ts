import { PaginatedUsersResponse } from '../types';

/**
 * Simple LRU Cache implementation for API responses
 * Helps reduce file I/O for frequently requested pages
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache for paginated user responses
const paginationCache = new LRUCache<string, PaginatedUsersResponse>(100);

export const getCachedUsers = (cacheKey: string): PaginatedUsersResponse | undefined => {
  return paginationCache.get(cacheKey);
};

export const setCachedUsers = (cacheKey: string, data: PaginatedUsersResponse): void => {
  paginationCache.set(cacheKey, data);
};

export const generateCacheKey = (page: number, limit: number, letter?: string, search?: string): string => {
  return `${page}-${limit}-${letter || 'all'}-${search || ''}`;
};

export const clearCache = (): void => {
  paginationCache.clear();
};
