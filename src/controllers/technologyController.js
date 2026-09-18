import * as technologyService from '../services/technologyService.js';

export const index = async (_req, res) => {
  try {
    const grouped = await technologyService.getAll();
    res.json({ success: true, data: grouped });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
