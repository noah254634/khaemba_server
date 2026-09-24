import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

// GET /api/cv — Redirect to the CV stored in R2
router.get('/', async (_req, res) => {
  try {
    const profile = await Profile.findOne().select('cvUrl').lean();
    if (profile && profile.cvUrl) {
      return res.redirect(profile.cvUrl);
    }
  } catch (err) {
    console.error('CV redirect error:', err.message);
  }

  return res.status(404).json({ success: false, error: 'CV not available yet.' });
});

export default router;
