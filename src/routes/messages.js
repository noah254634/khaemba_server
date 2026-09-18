import express from 'express';
import { index, destroy } from '../controllers/messageController.js';
import { requireJwt } from '../middleware/auth.js';

const router = express.Router();

// GET  /api/messages       [JWT required]
router.get('/',     requireJwt, index);

// DELETE /api/messages/:id [JWT required]
router.delete('/:id', requireJwt, destroy);

export default router;
