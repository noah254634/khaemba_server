import express from 'express';
import { trackVisit, heartbeat, getStats, deleteVisit, deleteVisitsByDevice } from '../controllers/analyticsController.js';
import { requireJwt } from '../middleware/auth.js';

const router = express.Router();

// POST /api/analytics/track [Public]
router.post('/track', trackVisit);

// POST /api/analytics/heartbeat [Public]
router.post('/heartbeat', heartbeat);

// GET /api/analytics/stats [JWT required]
router.get('/stats', requireJwt, getStats);

// DELETE /api/analytics/visit/:id [JWT required]
router.delete('/visit/:id', requireJwt, deleteVisit);

// DELETE /api/analytics/device/:deviceType [JWT required]
router.delete('/device/:deviceType', requireJwt, deleteVisitsByDevice);

export default router;
