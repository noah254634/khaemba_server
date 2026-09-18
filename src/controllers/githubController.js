import * as githubService from '../services/githubService.js';

export const pinned = async (_req, res) => {
  try {
    const repos = await githubService.getPinnedRepos();
    res.json({ success: true, data: repos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const contributions = async (_req, res) => {
  try {
    const calendar = await githubService.getContributions();
    res.json({ success: true, data: calendar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
