import express from 'express';
import multer from 'multer';
import { getProfile, updateProfile, uploadAvatar, uploadCv } from '../controllers/profileController.js';
import { requireJwt } from '../middleware/auth.js';
import { fastCache } from '../middleware/fastCache.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for photos/PDFs
});

const router = express.Router();

// GET /api/profile [Public]
router.get('/', fastCache(), getProfile);

// PATCH /api/profile [JWT required]
router.patch('/', requireJwt, updateProfile);

// POST /api/profile/avatar [JWT required]
router.post('/avatar', requireJwt, upload.single('file'), uploadAvatar);

// POST /api/profile/cv [JWT required]
router.post('/cv', requireJwt, upload.single('file'), uploadCv);

export default router;
