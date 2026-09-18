import Project from '../models/Project.js';
import ProjectImage from '../models/ProjectImage.js';

export const getAllProjects = async (filter = {}) => {
  const projects = await Project.find(filter)
    .select('-sections -longDescription')
    .populate('stack', 'name slug icon category color')
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .lean();

  const projectIds = projects.map((p) => p._id);
  const allImages = await ProjectImage.find({ projectId: { $in: projectIds } })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const imagesByProject = {};
  for (const img of allImages) {
    const key = img.projectId.toString();
    if (!imagesByProject[key]) imagesByProject[key] = [];
    imagesByProject[key].push(img);
  }

  return projects.map((p) => {
    const pImgs = imagesByProject[p._id.toString()] || [];
    const heroImg = pImgs.find((img) => img.role === 'hero') || pImgs[0] || null;
    return {
      ...p,
      heroImage: heroImg ? heroImg.url : null,
      images: pImgs,
    };
  });
};

export const getProjectBySlug = async (slug, includeArchived = false) => {
  const query = { slug };
  if (!includeArchived) {
    query.status = { $ne: 'ARCHIVED' };
  }

  const project = await Project.findOne(query)
    .populate('stack', 'name slug icon category color')
    .lean();

  if (!project) return null;

  const images = await ProjectImage.find({ projectId: project._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  const heroImg = images.find((img) => img.role === 'hero') || images[0] || null;

  return {
    ...project,
    heroImage: heroImg ? heroImg.url : null,
    images,
  };
};

export const createProject = async (data) => {
  return Project.create(data);
};

export const updateProject = async (slug, data) => {
  const { slug: _slug, ...safeData } = data;
  return Project.findOneAndUpdate(
    { slug },
    safeData,
    { new: true, runValidators: true },
  ).populate('stack', 'name slug icon category color');
};

export const deleteProject = async (slug) => {
  return Project.findOneAndDelete({ slug });
};
