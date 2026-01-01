import { Router } from 'express';
import * as userController from '../controllers/userController';

const router = Router();

router.get('/paginated', userController.getPaginatedUsers);
router.get('/alphabet-stats', userController.getAlphabetStats);
router.get('/search', userController.searchUsers);
router.get('/jump-to-letter/:letter', userController.jumpToLetter);

export default router;
