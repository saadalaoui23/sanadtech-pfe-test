import * as fs from 'fs/promises';
import * as path from 'path';
import { AlphabetIndex, FullStats } from '../types';

const INDEXES_DIR = path.join(__dirname, '../../data/indexes');

/**
 * Retrieves the alphabetical index for a specific letter
 * Returns null if index doesn't exist
 */
export const getIndexForLetter = async (letter: string): Promise<AlphabetIndex | null> => {
  try {
    const indexFile = path.join(INDEXES_DIR, `${letter.toUpperCase()}.json`);
    const data = await fs.readFile(indexFile, 'utf-8');
    return JSON.parse(data) as AlphabetIndex;
  } catch (error) {
    // If index file doesn't exist, return null
    return null;
  }
};

/**
 * Retrieves full statistics about the dataset
 */
export const getFullStats = async (): Promise<FullStats> => {
  try {
    const statsFile = path.join(INDEXES_DIR, 'stats.json');
    const data = await fs.readFile(statsFile, 'utf-8');
    return JSON.parse(data) as FullStats;
  } catch (error) {
    // Return default stats if file doesn't exist
    return { total: 0 };
  }
};

/**
 * Retrieves all alphabet statistics for navigation menu
 */
export const getAllAlphabetStats = async (): Promise<{ [letter: string]: { count: number; startIndex: number } }> => {
  const stats: { [letter: string]: { count: number; startIndex: number } } = {};
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  for (const letter of letters) {
    const index = await getIndexForLetter(letter);
    if (index) {
      stats[letter] = {
        count: index.count,
        startIndex: index.start,
      };
    } else {
      stats[letter] = {
        count: 0,
        startIndex: 0,
      };
    }
  }

  return stats;
};

/**
 * Saves an alphabetical index to disk
 */
export const saveIndex = async (letter: string, indexData: AlphabetIndex): Promise<void> => {
  try {
    await fs.mkdir(INDEXES_DIR, { recursive: true });
    const indexFile = path.join(INDEXES_DIR, `${letter.toUpperCase()}.json`);
    await fs.writeFile(indexFile, JSON.stringify(indexData, null, 2));
  } catch (error) {
    // Correction ici : Cast de error en Error pour accéder à .message
    throw new Error(`Failed to save index: ${(error as Error).message}`);
  }
};

/**
 * Saves full statistics to disk
 */
export const saveStats = async (stats: FullStats): Promise<void> => {
  try {
    await fs.mkdir(INDEXES_DIR, { recursive: true });
    const statsFile = path.join(INDEXES_DIR, 'stats.json');
    await fs.writeFile(statsFile, JSON.stringify(stats, null, 2));
  } catch (error) {
    // Correction ici : Cast de error en Error pour accéder à .message
    throw new Error(`Failed to save stats: ${(error as Error).message}`);
  }
};