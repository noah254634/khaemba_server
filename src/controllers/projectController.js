import * as projectService from '../services/projectService.js';
import { clearCache } from '../middleware/fastCache.js';

export const index = async (req, res) => {
  try {
    const { category, featured, includeArchived } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;

    // Filter out ARCHIVED projects at DB query level for public UI unless explicitly requested by admin
    if (includeArchived !== 'true') {
      filter.status = { $ne: 'ARCHIVED' };
    }

    const projects = await projectService.getAllProjects(filter);
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const show = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const project = await projectService.getProjectBySlug(req.params.slug, includeArchived === 'true');
    if (!project)
      return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    clearCache('/projects');
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.slug, req.body);
    if (!project)
      return res.status(404).json({ success: false, error: 'Project not found' });
    clearCache('/projects');
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const destroy = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.slug);
    if (!project)
      return res.status(404).json({ success: false, error: 'Project not found' });
    clearCache('/projects');
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
