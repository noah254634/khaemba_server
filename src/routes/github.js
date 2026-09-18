import express from 'express';
import { pinned, contributions } from '../controllers/githubController.js';

const router = express.Router();

router.get('/pinned',        pinned);
router.get('/contributions', contributions);

export default router;
