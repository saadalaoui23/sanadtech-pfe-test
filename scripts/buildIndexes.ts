import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';
import { saveIndex, saveStats } from '../backend/src/services/indexService';

const USERS_FILE = path.join(__dirname, '../backend/data/users.txt');

interface LetterIndex {
  start: number | null;
  end: number | null;
  count: number;
}

const buildIndexes = async () => {
  console.log('Building alphabetical indexes...');

  const indexes: { [letter: string]: LetterIndex } = {};
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Initialize indexes
  letters.forEach((letter) => {
    indexes[letter] = { start: null, end: null, count: 0 };
  });

  let totalUsers = 0;
  let currentLetter: string | null = null;

  const stream = fs.createReadStream(USERS_FILE);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    // Assume format: "Prénom Nom" or "Prénom,Nom" or just a name
    const name = trimmedLine;
    const firstLetter = name.charAt(0).toUpperCase();

    if (firstLetter >= 'A' && firstLetter <= 'Z') {
      // If letter changed, finalize previous letter
      if (currentLetter && currentLetter !== firstLetter) {
        indexes[currentLetter].end = totalUsers - 1;
      }

      // Start new letter range
      if (indexes[firstLetter].start === null) {
        indexes[firstLetter].start = totalUsers;
        currentLetter = firstLetter;
      }

      indexes[firstLetter].count++;
    }

    totalUsers++;
  }

  // Finalize last letter
  if (currentLetter) {
    indexes[currentLetter].end = totalUsers - 1;
  }

  // Save indexes
  for (const letter of letters) {
    if (indexes[letter].start !== null) {
      await saveIndex(letter, {
        start: indexes[letter].start!,
        end: indexes[letter].end!,
        count: indexes[letter].count,
      });
      console.log(
        `Index for ${letter}: ${indexes[letter].count.toLocaleString()} users (${indexes[letter].start} - ${indexes[letter].end})`
      );
    }
  }

  // Save stats
  await saveStats({ total: totalUsers });

  console.log(`\nTotal users indexed: ${totalUsers.toLocaleString()}`);
  console.log('Indexes built successfully!');
};

buildIndexes().catch(console.error);
