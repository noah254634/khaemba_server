import * as testimonialService from '../services/testimonialService.js';
import { clearCache } from '../middleware/fastCache.js';
import { uploadToR2 } from '../services/r2Service.js';

export const index = async (req, res) => {
  try {
    const testimonials = await testimonialService.getAll(req.query.includeUnpublished === 'true');
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const testimonial = await testimonialService.create(req.body);
    clearCache('/testimonials');
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Please select an image file.' });

    const { url } = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ success: true, avatarUrl: url });
  } catch (err) {
    console.error('❌ [Testimonial Avatar Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Avatar upload failed' });
  }
};

export const update = async (req, res) => {
  try {
    const testimonial = await testimonialService.update(req.params.id, req.body);
    if (!testimonial) return res.status(404).json({ success: false, error: 'Testimonial not found.' });
    clearCache('/testimonials');
    res.json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const testimonial = await testimonialService.remove(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, error: 'Testimonial not found.' });
    clearCache('/testimonials');
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
