import express from 'express';
import { authController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.get('/session', authController.session);
router.get("/me", authController.getMe)
router.get("/", authController.getAdmins)
export default router;
