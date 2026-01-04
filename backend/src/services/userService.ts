import { pool } from '../config/db';
import { User, GetUsersParams, PaginatedUsersResponse, SearchResponse } from '../types';

// Mapper pour transformer les données brutes SQL en objet User frontend
const mapDbRowToUser = (row: any): User => {
    const fullName = row.name;
    const parts = fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    
    // Génération d'un email fictif cohérent
    const emailName = fullName.toLowerCase().replace(/[^a-z0-9]/g, '.');

    return {
        id: row.id,
        name: row.name,
        firstName,
        lastName,
        email: `${emailName}@example.com`
    };
};

/**
 * Récupération paginée standard + Filtre par lettre
 */
export const getUsers = async (params: GetUsersParams): Promise<PaginatedUsersResponse> => {
    const { page, limit, letter, search } = params; // Ajout de 'search' au cas où
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM users';
        let countQuery = 'SELECT COUNT(*) FROM users'; 
        const queryParams: any[] = [];
        
        // --- CORRECTION CRITIQUE ICI (ILIKE) ---
        if (letter) {
            // On utilise ILIKE pour que 'x' trouve 'Xavier'
            query += ' WHERE name ILIKE $1';
            countQuery += ' WHERE name ILIKE $1';
            queryParams.push(`${letter}%`); 
        }
        // ----------------------------------------

        // Gestion de la pagination dynamique
        const limitIndex = queryParams.length + 1;
        const offsetIndex = queryParams.length + 2;
        
        query += ` ORDER BY name ASC LIMIT $${limitIndex} OFFSET $${offsetIndex}`;
        
        const [rowsResult, countResult] = await Promise.all([
            pool.query(query, [...queryParams, limit, offset]),
            pool.query(countQuery, queryParams)
        ]);

        const total = parseInt(countResult.rows[0].count, 10);
        const users = rowsResult.rows.map(mapDbRowToUser);

        return {
            users,
            hasMore: offset + users.length < total,
            total,
            page
        };
    } catch (error: any) {
        throw new Error(`Erreur DB: ${error.message}`);
    }
};

/**
 * Recherche Full-Text (Optimisée GIN)
 */
export const searchUsers = async (queryText: string, limit: number, page: number = 1): Promise<SearchResponse> => {
    if (!queryText) return { users: [], total: 0, hasMore: false, page };

    const offset = (page - 1) * limit;

    try {
        const sql = `
            SELECT * FROM users 
            WHERE name ILIKE $1 
            ORDER BY name ASC 
            LIMIT $2 OFFSET $3
        `;
        
        const countSql = `SELECT COUNT(*) FROM users WHERE name ILIKE $1`;

        const [res, countRes] = await Promise.all([
            pool.query(sql, [`%${queryText}%`, limit, offset]),
            pool.query(countSql, [`%${queryText}%`])
        ]);

        const totalMatches = parseInt(countRes.rows[0].count, 10);
        const users = res.rows.map(mapDbRowToUser);

        return {
            users,
            total: totalMatches,
            hasMore: offset + users.length < totalMatches,
            page
        };
    } catch (error: any) {
        throw new Error(`Erreur recherche: ${error.message}`);
    }
};

/**
 * Stats Alphabétiques
 */
export const getAlphabetStats = async () => {
    try {
        const sql = `
            SELECT UPPER(LEFT(name, 1)) as letter, COUNT(*) as count 
            FROM users 
            WHERE name ~ '^[a-zA-Z]' 
            GROUP BY UPPER(LEFT(name, 1)) 
            ORDER BY letter ASC
        `;
        const result = await pool.query(sql);
        
        const stats: Record<string, any> = {};
        let runningTotal = 0;

        result.rows.forEach(row => {
            stats[row.letter] = {
                count: parseInt(row.count, 10),
                start: runningTotal
            };
            runningTotal += parseInt(row.count, 10);
        });

        return stats;
    } catch (error: any) {
        throw new Error(`Erreur stats: ${error.message}`);
    }
};

// 👇👇👇 C'EST CETTE FONCTION QUI MANQUAIT 👇👇👇
export const getUsersByLetter = async (letter: string, limit: number = 100): Promise<PaginatedUsersResponse> => {
    // C'est juste un alias pratique qui appelle la fonction principale
    return getUsers({ page: 1, limit, letter });
};