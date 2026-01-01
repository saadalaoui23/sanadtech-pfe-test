const fs = require('fs').promises;
const readline = require('readline');
const path = require('path');
const indexService = require('../backend/src/services/indexService');

const USERS_FILE = path.join(__dirname, '../backend/data/users.txt');
const INDEXES_DIR = path.join(__dirname, '../backend/data/indexes');

const buildIndexes = async () => {
  console.log('Building alphabetical indexes...');

  const indexes = {};
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Initialize indexes
  letters.forEach((letter) => {
    indexes[letter] = { start: null, end: null, count: 0 };
  });

  let totalUsers = 0;
  let currentLetter = null;
  let startIndex = 0;

  const fsSync = require('fs');
  const stream = fsSync.createReadStream(USERS_FILE);
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
  await fs.mkdir(INDEXES_DIR, { recursive: true });

  for (const letter of letters) {
    if (indexes[letter].start !== null) {
      await indexService.saveIndex(letter, {
        start: indexes[letter].start,
        end: indexes[letter].end,
        count: indexes[letter].count,
      });
      console.log(`Index for ${letter}: ${indexes[letter].count.toLocaleString()} users (${indexes[letter].start} - ${indexes[letter].end})`);
    }
  }

  // Save stats
  await indexService.saveStats({ total: totalUsers });

  console.log(`\nTotal users indexed: ${totalUsers.toLocaleString()}`);
  console.log('Indexes built successfully!');
};

buildIndexes().catch(console.error);
