import Technology from '../models/Technology.js';

export const getAll = async () => {
  const techs = await Technology.find().sort({ category: 1, name: 1 }).lean();

  // Group by category for convenient frontend consumption
  return techs.reduce((acc, tech) => {
    const key = tech.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tech);
    return acc;
  }, {});
};

export const findBySlug = async (slug) =>
  Technology.findOne({ slug }).lean();

export const create = async (data) =>
  Technology.create(data);
