import express from 'express';
import { submit } from '../controllers/contactController.js';
import { validateContact } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateContact, submit);

export default router;

