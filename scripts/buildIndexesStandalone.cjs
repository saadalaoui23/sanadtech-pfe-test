/* scripts/buildIndexesStandalone.cjs */
const fs = require('fs');
const fsPromises = require('fs').promises;
const readline = require('readline');
const path = require('path');

// Chemins des fichiers
const USERS_FILE = path.join(__dirname, '../backend/data/users.txt');
const INDEXES_DIR = path.join(__dirname, '../backend/data/indexes');

// --- Fonctions utilitaires (reproduisent indexService.ts) ---

async function saveIndex(letter, indexData) {
    const filePath = path.join(INDEXES_DIR, `${letter}.json`);
    await fsPromises.writeFile(filePath, JSON.stringify(indexData, null, 2), 'utf-8');
}

async function saveStats(statsData) {
    const filePath = path.join(INDEXES_DIR, 'stats.json');
    await fsPromises.writeFile(filePath, JSON.stringify(statsData, null, 2), 'utf-8');
}

// --- Logique principale ---

const buildIndexes = async () => {
    console.log('Building alphabetical indexes...');

    // Assurer que le dossier existe
    if (!fs.existsSync(INDEXES_DIR)) {
        await fsPromises.mkdir(INDEXES_DIR, { recursive: true });
    }

    const indexes = {};
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Initialisation
    letters.forEach((letter) => {
        indexes[letter] = { start: null, end: null, count: 0 };
    });

    let totalUsers = 0;
    let currentLetter = null;

    // Lecture du fichier ligne par ligne
    const stream = fs.createReadStream(USERS_FILE);
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const trimmedLine = line.trim();

        // Ignorer les lignes vides ou commentaires
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        const name = trimmedLine;
        const firstLetter = name.charAt(0).toUpperCase();

        if (firstLetter >= 'A' && firstLetter <= 'Z') {
            // Si la lettre change, on ferme la précédente
            if (currentLetter && currentLetter !== firstLetter) {
                indexes[currentLetter].end = totalUsers - 1;
            }

            // Démarrage d'une nouvelle plage de lettre
            if (indexes[firstLetter].start === null) {
                indexes[firstLetter].start = totalUsers;
                currentLetter = firstLetter;
            }

            indexes[firstLetter].count++;
        }

        totalUsers++;
    }

    // Fermer la dernière lettre
    if (currentLetter) {
        indexes[currentLetter].end = totalUsers - 1;
    }

    // Sauvegarde des fichiers JSON par lettre
    for (const letter of letters) {
        if (indexes[letter].start !== null) {
            await saveIndex(letter, {
                start: indexes[letter].start,
                end: indexes[letter].end,
                count: indexes[letter].count,
            });
            console.log(
                `Index for ${letter}: ${indexes[letter].count.toLocaleString()} users (${indexes[letter].start} - ${indexes[letter].end})`
            );
        }
    }

    // Sauvegarde des stats globales
    await saveStats({ total: totalUsers });

    console.log(`\nTotal users indexed: ${totalUsers.toLocaleString()}`);
    console.log('Indexes built successfully!');
};

buildIndexes().catch(console.error);