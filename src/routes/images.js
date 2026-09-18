import express from 'express';
import multer from 'multer';
import { index, create, update, destroy } from '../controllers/imageController.js';
import { requireJwt } from '../middleware/auth.js';
import { fastCache } from '../middleware/fastCache.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max photo size
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.'));
    }
  },
});

const router = express.Router({ mergeParams: true }); // inherits :slug from parent

// GET    /api/projects/:slug/images  [Public]
router.get('/', fastCache(), index);

// POST   /api/projects/:slug/images  [JWT required] -> Multer handles file field named 'file' or 'image'
router.post('/', requireJwt, upload.single('file'), create);

// PATCH  /api/projects/:slug/images/:imageId  [JWT required]
router.patch('/:imageId', requireJwt, update);

// DELETE /api/projects/:slug/images/:imageId  [JWT required]
router.delete('/:imageId', requireJwt, destroy);

export default router;
