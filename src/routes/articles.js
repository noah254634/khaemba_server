import express from 'express';
import { index, show, create } from '../controllers/articleController.js';
import { requireJwt } from '../middleware/auth.js';
import { validateArticle } from '../middleware/validate.js';
import { fastCache } from '../middleware/fastCache.js';

const router = express.Router();

// GET  /api/articles          ?page=1&limit=10
router.get('/', fastCache(), index);

// GET  /api/articles/:slug
router.get('/:slug', fastCache(), show);

// POST /api/articles          [JWT required]
router.post('/', requireJwt, validateArticle, create);

export default router;
