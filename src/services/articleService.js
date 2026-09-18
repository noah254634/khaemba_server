import Article from '../models/Article.js';

export const getAll = async ({ page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Article.find({ published: true })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tags', 'name slug')
      .lean(),
    Article.countDocuments({ published: true }),
  ]);
  return { data, total, page, limit, pages: Math.ceil(total / limit) };
};

export const findBySlug = async (slug) =>
  Article.findOne({ slug, published: true }).populate('tags', 'name slug').lean();

export const create = async (data) => {
  const article = new Article(data);
  await article.save(); // triggers publishedAt pre-save hook
  return article;
};
