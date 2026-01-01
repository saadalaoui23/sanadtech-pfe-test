import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import * as indexService from '../services/indexService';

/**
 * GET /api/users/paginated
 * Retrieves paginated list of users with optional filtering
 */
export const getPaginatedUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500); // Max 500 per page
    const letter = req.query.letter as string | undefined;
    const search = req.query.search as string | undefined;

    if (page < 1) {
      res.status(400).json({ error: 'Page must be greater than 0' });
      return;
    }

    const result = await userService.getUsers({ page, limit, letter, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/alphabet-stats
 * Returns statistics for each letter (count and start index)
 */
export const getAlphabetStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await indexService.getAllAlphabetStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/search
 * Searches for users matching a query string
 */
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.q as string;
    const maxResults = Math.min(parseInt(req.query.maxResults as string) || 100, 500);

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const result = await userService.searchUsers(query, maxResults);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/jump-to-letter/:letter
 * Returns the first page of users starting with the specified letter
 */
export const jumpToLetter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const letter = req.params.letter?.toUpperCase();
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

    if (!letter || !/^[A-Z]$/.test(letter)) {
      res.status(400).json({ error: 'Invalid letter. Must be A-Z' });
      return;
    }

    const result = await userService.getUsersByLetter(letter, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
