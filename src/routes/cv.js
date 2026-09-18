import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Profile from '../models/Profile.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GET /api/cv — Stream or redirect to active CV PDF
router.get('/', async (_req, res) => {
  try {
    const profile = await Profile.findOne().select('cvUrl').lean();
    if (profile && profile.cvUrl) {
      return res.redirect(profile.cvUrl);
    }
  } catch (err) {
    console.error('CV redirect error:', err.message);
  }

  const cvPath = path.resolve(__dirname, '../../assets/noah_khaemba_cv.pdf');

  if (!fs.existsSync(cvPath)) {
    return res.status(404).json({ success: false, error: 'CV not available yet.' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="Noah_Khaemba_CV.pdf"');
  fs.createReadStream(cvPath).pipe(res);
});

export default router;
