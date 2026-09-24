import express from 'express';
import multer from 'multer';
import { index, create, update, destroy, uploadAvatar } from '../controllers/testimonialController.js';
import { requireJwt } from '../middleware/auth.js';
import { validateTestimonial } from '../middleware/validate.js';
import { fastCache } from '../middleware/fastCache.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/')) return callback(null, true);
    callback(new Error('Only image files are supported.'));
  },
});

router.get('/', (req, res, next) => {
  if (req.query.includeUnpublished === 'true') return requireJwt(req, res, next);
  next();
}, fastCache(), index);
router.post('/', requireJwt, validateTestimonial, create);
router.post('/avatar', requireJwt, upload.single('file'), uploadAvatar);
router.patch('/:id', requireJwt, validateTestimonial, update);
router.delete('/:id', requireJwt, destroy);

export default router;
