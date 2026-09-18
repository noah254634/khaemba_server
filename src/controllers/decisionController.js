import * as decisionService from '../services/decisionService.js';
import { clearCache } from '../middleware/fastCache.js';

export const index = async (req, res) => {
  try {
    const decisions = await decisionService.getAllDecisions(req.params.slug);
    if (decisions === null)
      return res.status(404).json({ success: false, error: 'Project not found.' });
    res.json({ success: true, count: decisions.length, data: decisions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const decision = await decisionService.createDecision(req.params.slug, req.body);
    if (!decision)
      return res.status(404).json({ success: false, error: 'Project not found.' });
    clearCache('/decisions');
    clearCache('/projects');
    res.status(201).json({ success: true, data: decision });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const decision = await decisionService.deleteDecision(req.params.id);
    if (!decision)
      return res.status(404).json({ success: false, error: 'Decision not found.' });
    clearCache('/decisions');
    clearCache('/projects');
    res.json({ success: true, message: 'Decision deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

