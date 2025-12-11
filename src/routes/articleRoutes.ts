// Article routes
import { Router } from 'express';
import { getArticles, getArticleById } from '../controllers/articleController';
import { requireUserId } from '../middleware/auth';

const router = Router();

// All article routes require userId header
router.use(requireUserId);

router.get('/', getArticles);
router.get('/:id', getArticleById);

export default router;

