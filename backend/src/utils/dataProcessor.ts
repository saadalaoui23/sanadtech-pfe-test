import * as fs from 'fs';
import * as readline from 'readline';
import { User } from '../types';

/**
 * Reads users from file using streaming to avoid loading entire file in memory
 * Only reads the lines between startIndex and endIndex
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
      break;
    }

    const trimmedLine = line.trim();

    // Skip empty lines and comments
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
 * Parses a line containing a name and converts it to a User object
 * Supports formats: "Prénom Nom", "Prénom,Nom", or just a name
 */
export const parseUserLine = (line: string, id: number): User | null => {
  if (!line || !line.trim()) return null;

  const name = line.trim();
  let firstName = '';
  let lastName = '';
  let fullName = name;

  if (name.includes(',')) {
    // Format: "Prénom,Nom"
    const parts = name.split(',');
    firstName = parts[0]?.trim() || '';
    lastName = parts.slice(1).join(',').trim();
    fullName = `${firstName} ${lastName}`;
  } else if (name.includes(' ')) {
    // Format: "Prénom Nom" or "Prénom Nom1 Nom2"
    const parts = name.split(' ');
    firstName = parts[0]?.trim() || '';
    lastName = parts.slice(1).join(' ').trim();
    fullName = name;
  } else {
    // Just a single name
    fullName = name;
    firstName = name;
  }

  // Generate email from name
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
 * Search for users matching a query string
 * Reads file line-by-line and stops when maxResults is reached
 * Note: For truly sorted data, binary search would be more efficient
 * but requires the file to be sorted, which may not be the case
 */
export const binarySearchUsers = async (
  filePath: string,
  query: string,
  maxResults: number = 100
): Promise<{ users: User[]; positions: number[] }> => {
  const results: User[] = [];
  const positions: number[] = [];
  let currentIndex = 0;
  const queryLower = query.toLowerCase();

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (results.length >= maxResults) {
      break;
    }

    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const nameLower = trimmedLine.toLowerCase();
      if (nameLower.includes(queryLower)) {
        const user = parseUserLine(trimmedLine, currentIndex + 1);
        if (user) {
          results.push(user);
          positions.push(currentIndex);
        }
      }
    }
    currentIndex++;
  }

  return { users: results, positions };
};
