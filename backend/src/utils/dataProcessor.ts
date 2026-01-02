import * as fs from 'fs';
import * as readline from 'readline';
import { User } from '../types';

/**
 * Parses a line containing a name and converts it to a User object.
 * Logic maintained from original code for consistency.
 */
export const parseUserLine = (line: string, id: number): User | null => {
  if (!line || !line.trim()) return null;

  const name = line.trim();
  let firstName = '';
  let lastName = '';
  let fullName = name;

  if (name.includes(',')) {
    // Format: "Last, First" or "First,Last" depending on your file structure, 
    // sticking to your logic: parts[0] is First
    const parts = name.split(',');
    firstName = parts[0]?.trim() || '';
    lastName = parts.slice(1).join(',').trim();
    fullName = `${firstName} ${lastName}`;
  } else if (name.includes(' ')) {
    // Format: "Prénom Nom"
    const parts = name.split(' ');
    firstName = parts[0]?.trim() || '';
    lastName = parts.slice(1).join(' ').trim();
    fullName = name;
  } else {
    // Single name
    fullName = name;
    firstName = name;
  }

  // Generate mock email
  const emailName = fullName
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
  const email = `${emailName}@example.com`;

  return {
    id,
    name: fullName,
    firstName,
    lastName,
    email,
  };
};

/**
 * Reads users from file using streaming to avoid loading entire file in memory.
 * Used for specific index ranges (e.g. Navigation by Letter).
 */
export const readUsersFromFile = async (
  filePath: string,
  startIndex: number,
  endIndex: number
): Promise<User[]> => {
  const users: User[] = [];
  let currentIndex = 0;

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (currentIndex >= endIndex) {
      // Optimization: Close stream immediately once we have the data
      rl.close();
      fileStream.destroy();
      break;
    }

    const trimmedLine = line.trim();

    if (currentIndex >= startIndex && trimmedLine && !trimmedLine.startsWith('#')) {
      const user = parseUserLine(trimmedLine, currentIndex + 1);
      if (user) {
        users.push(user);
      }
    }

    currentIndex++;
  }

  return users;
};

/**
 * SCALABLE SEARCH FUNCTION (The "Option B" Solution)
 * * Performs a linear scan via Stream.
 * Memory Complexity: O(1) - Only holds the current line and the result page in RAM.
 * Time Complexity: O(N) - Worst case scans file, but stops early ("break") when page is full.
 */
export const searchUsersInFile = async (
  filePath: string,
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<{ users: User[]; hasMore: boolean; totalMatches: number }> => {
  const results: User[] = [];
  const queryLower = query.toLowerCase();
  
  // Calculate how many matches we need to skip to get to the requested page
  const skip = (page - 1) * limit;
  
  let matchesFound = 0;
  let hasMore = false;
  let currentIndex = 0;

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    currentIndex++;
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    // 1. Fast text check before parsing (Performance optimization)
    if (trimmedLine.toLowerCase().includes(queryLower)) {
      
      // 2. Parse object
      const user = parseUserLine(trimmedLine, currentIndex);
      
      if (user) {
        // 3. Double check match on specific fields to be accurate
        const matchName = user.name.toLowerCase().includes(queryLower);
        const matchEmail = user.email.toLowerCase().includes(queryLower);

        if (matchName || matchEmail) {
          matchesFound++;

          // Pagination Logic
          if (matchesFound <= skip) {
            continue; // Skip items from previous pages
          }

          if (results.length < limit) {
            results.push(user);
          } else {
            // If we found one more item than the limit, it means there is a next page
            hasMore = true;
            rl.close(); // Stop reading the file! This is crucial for performance.
            fileStream.destroy();
            break; 
          }
        }
      }
    }
  }

  // Note: For 10M users, calculating the EXACT total is too slow (requires full scan).
  // We return a "fake" total if hasMore is true to satisfy UI counters.
  const estimatedTotal = hasMore ? matchesFound + 100 : matchesFound;

  return { 
    users: results, 
    hasMore, 
    totalMatches: estimatedTotal 
  };
};

// Deprecated: kept for backward compatibility if needed, but redirects to new logic
export const binarySearchUsers = async (
  filePath: string,
  query: string,
  maxResults: number = 100
) => {
   const result = await searchUsersInFile(filePath, query, 1, maxResults);
   return { users: result.users, positions: [] };
};