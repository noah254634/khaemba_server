import EngineeringDecision from '../models/EngineeringDecision.js';
import Project from '../models/Project.js';

/** Resolve a project slug to its ObjectId */
const getProjectId = async (slug) => {
  const p = await Project.findOne({ slug }).select('_id').lean();
  return p ? p._id : null;
};

export const getAllDecisions = async (slug) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;
  return EngineeringDecision.find({ projectId }).sort({ order: 1 }).lean();
};

export const createDecision = async (slug, data) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;
  return EngineeringDecision.create({ ...data, projectId });
};

export const deleteDecision = async (id) => {
  return EngineeringDecision.findByIdAndDelete(id);
};

