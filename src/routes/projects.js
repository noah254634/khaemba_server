import express from 'express';
import { index, show, create, update, destroy } from '../controllers/projectController.js';
import { requireJwt } from '../middleware/auth.js';
import { validateProject } from '../middleware/validate.js';
import { fastCache } from '../middleware/fastCache.js';
import decisionsRouter from './decisions.js';
import imagesRouter from './images.js';

const router = express.Router();

// ── Sub-resource routes (nested under /:slug) ─────────────────────────────────
// mergeParams: true is set on those routers so they inherit :slug
router.use('/:slug/decisions', decisionsRouter);
router.use('/:slug/images',    imagesRouter);

// ── Project CRUD ──────────────────────────────────────────────────────────────
router.get('/',        fastCache(), index);
router.get('/:slug',   fastCache(), show);
router.post('/',       requireJwt, validateProject, create);
router.patch('/:slug',  requireJwt, update);
router.delete('/:slug', requireJwt, destroy);

export default router;
