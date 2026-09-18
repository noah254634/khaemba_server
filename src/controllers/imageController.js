import * as imageService from '../services/imageService.js';
import { clearCache } from '../middleware/fastCache.js';

export const index = async (req, res) => {
  try {
    const images = await imageService.getAllImages(req.params.slug);
    if (images === null) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }
    res.json({ success: true, count: images.length, data: images });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please select an image file to upload.' });
    }

    const description = req.body.description || req.body.caption;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Image description is required.' });
    }

    const image = await imageService.createImageFromBuffer(req.params.slug, req.file, {
      description,
      alt: req.body.alt || description,
      role: req.body.role || 'screenshot',
      order: req.body.order || 0,
    });

    if (!image) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    clearCache('/images');
    clearCache('/projects');
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    console.error('❌ [Image Upload Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Image upload failed.' });
  }
};

export const update = async (req, res) => {
  try {
    const updated = await imageService.updateImage(req.params.slug, req.params.imageId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Image not found.' });
    }
    clearCache('/images');
    clearCache('/projects');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const deleted = await imageService.deleteImage(req.params.slug, req.params.imageId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Image not found.' });
    }
    clearCache('/images');
    clearCache('/projects');
    res.json({ success: true, message: 'Image deleted successfully from R2 and database.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
