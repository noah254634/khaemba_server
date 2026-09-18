import Profile from '../models/Profile.js';
import { uploadToR2 } from '../services/r2Service.js';
import { clearCache } from '../middleware/fastCache.js';

export const getProfile = async (_req, res) => {
  try {
    let profile = await Profile.findOne().lean();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    await profile.save();
    clearCache('/profile');
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select an image file.' });
    }

    const { url } = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();

    profile.avatarUrl = url;
    await profile.save();

    clearCache('/profile');
    res.json({ success: true, avatarUrl: url, data: profile });
  } catch (err) {
    console.error('❌ [Avatar Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Avatar upload failed' });
  }
};

export const uploadCv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select a PDF file.' });
    }

    const { url } = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);

    let profile = await Profile.findOne();
    if (!profile) profile = new Profile();

    profile.cvUrl = url;
    await profile.save();

    clearCache('/profile');
    clearCache('/cv');
    res.json({ success: true, cvUrl: url, data: profile });
  } catch (err) {
    console.error('❌ [CV Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'CV upload failed' });
  }
};
