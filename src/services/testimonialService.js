import Testimonial from '../models/Testimonial.js';

export const getAll = async (includeUnpublished = false) => {
  const filter = includeUnpublished ? {} : { published: true };
  return Testimonial.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

export const create = async (data) => Testimonial.create(data);

export const update = async (id, data) =>
  Testimonial.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

export const remove = async (id) => Testimonial.findByIdAndDelete(id).lean();
