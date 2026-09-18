import * as articleService from '../services/articleService.js';
import { clearCache } from '../middleware/fastCache.js';

export const index = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const result = await articleService.getAll({ page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const show = async (req, res) => {
  try {
    const article = await articleService.findBySlug(req.params.slug);
    if (!article)
      return res.status(404).json({ success: false, error: 'Article not found.' });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const article = await articleService.create(req.body);
    clearCache('/articles');
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    const isDuplicate = err.code === 11000;
    res.status(isDuplicate ? 409 : 400).json({
      success: false,
      error: isDuplicate ? 'An article with this slug already exists.' : err.message,
    });
  }
};
