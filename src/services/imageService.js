import ProjectImage from '../models/ProjectImage.js';
import Project from '../models/Project.js';
import { uploadToR2, deleteFromR2 } from './r2Service.js';

const getProjectId = async (slug) => {
  const p = await Project.findOne({ slug }).select('_id').lean();
  return p ? p._id : null;
};

export const getAllImages = async (slug) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;
  return ProjectImage.find({ projectId }).sort({ order: 1, createdAt: -1 }).lean();
};

export const createImageFromBuffer = async (slug, file, metadata = {}) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;

  // Upload file buffer to Cloudflare R2
  const { key, url } = await uploadToR2(file.buffer, file.originalname, file.mimetype);

  const image = await ProjectImage.create({
    projectId,
    key,
    url,
    description: metadata.description || metadata.caption || 'Project photo',
    alt: metadata.alt || metadata.description || 'Project screenshot',
    role: metadata.role || 'screenshot',
    order: metadata.order ? Number(metadata.order) : 0,
  });

  return image;
};

export const updateImage = async (slug, imageId, updates = {}) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;

  return ProjectImage.findOneAndUpdate(
    { _id: imageId, projectId },
    { $set: updates },
    { new: true }
  );
};

export const deleteImage = async (slug, imageId) => {
  const projectId = await getProjectId(slug);
  if (!projectId) return null;

  const image = await ProjectImage.findOne({ _id: imageId, projectId });
  if (!image) return null;

  // Delete from Cloudflare R2 storage
  if (image.key) {
    await deleteFromR2(image.key);
  }

  await image.deleteOne();
  return true;
};
