import express from 'express';
import { index, create, destroy } from '../controllers/decisionController.js';
import { requireJwt } from '../middleware/auth.js';
import { validateDecision } from '../middleware/validate.js';
import { fastCache } from '../middleware/fastCache.js';

const router = express.Router({ mergeParams: true }); // inherits :slug from parent

// GET  /api/projects/:slug/decisions
router.get('/', fastCache(), index);

// POST /api/projects/:slug/decisions  [JWT required]
router.post('/', requireJwt, validateDecision, create);

// DELETE /api/projects/:slug/decisions/:id  [JWT required]
router.delete('/:id', requireJwt, destroy);

export default router;
