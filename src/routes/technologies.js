import express from 'express';
import { index } from '../controllers/technologyController.js';
import { fastCache } from '../middleware/fastCache.js';

const router = express.Router();

// GET /api/technologies    → grouped by category
router.get('/', fastCache(), index);

export default router;
