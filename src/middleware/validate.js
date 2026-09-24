/**
 * Request body validation middleware.
 * Validates fields before they reach the controller/service layer.
 * Uses plain checks — no external validation library needed.
 */

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUrl = (url) => {
  try { new URL(url); return true; } catch { return false; }
};

// ── Contact ───────────────────────────────────────────────────────────────────

export const validateContact = (req, res, next) => {
  const { name, email, subject, body } = req.body;
  const errors = [];

  if (!name?.trim()) errors.push('name is required');
  if (!email?.trim()) errors.push('email is required');
  else if (!isValidEmail(email)) errors.push('email is invalid');
  if (!subject?.trim()) errors.push('subject is required');
  if (!body?.trim()) errors.push('body is required');
  if (body?.length > 5000) errors.push('body must be 5000 characters or fewer');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};

// ── Project ───────────────────────────────────────────────────────────────────

export const validateProject = (req, res, next) => {
  const { title, slug, description, category, status } = req.body;
  const CATEGORIES = ['infra', 'data', 'payments', 'ml', 'other'];
  const STATUSES = ['LIVE', 'BUILDING', 'ARCHIVED'];
  const errors = [];

  if (!title?.trim()) errors.push('title is required');
  if (!slug?.trim()) errors.push('slug is required');
  else if (!/^[a-z0-9-]+$/.test(slug)) errors.push('slug must be lowercase alphanumeric with hyphens only');
  if (!description?.trim()) errors.push('description is required');
  if (description?.length > 500) errors.push('description must be 500 characters or fewer');
  if (category && !CATEGORIES.includes(category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (status && !STATUSES.includes(status)) errors.push(`status must be one of: ${STATUSES.join(', ')}`);

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};

// ── Engineering Decision ──────────────────────────────────────────────────────

export const validateDecision = (req, res, next) => {
  const { question, decision, reasoning } = req.body;
  const errors = [];

  if (!question?.trim()) errors.push('question is required');
  if (question?.length > 300) errors.push('question must be 300 characters or fewer');
  if (!decision?.trim()) errors.push('decision is required');
  if (decision?.length > 300) errors.push('decision must be 300 characters or fewer');
  if (!reasoning?.trim()) errors.push('reasoning is required');
  if (reasoning?.length > 2000) errors.push('reasoning must be 2000 characters or fewer');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};

// ── Article ───────────────────────────────────────────────────────────────────

export const validateArticle = (req, res, next) => {
  const { slug, title, excerpt, content } = req.body;
  const errors = [];

  if (!slug?.trim()) errors.push('slug is required');
  else if (!/^[a-z0-9-]+$/.test(slug)) errors.push('slug must be lowercase alphanumeric with hyphens only');
  if (!title?.trim()) errors.push('title is required');
  if (title?.length > 200) errors.push('title must be 200 characters or fewer');
  if (!excerpt?.trim()) errors.push('excerpt is required');
  if (excerpt?.length > 500) errors.push('excerpt must be 500 characters or fewer');
  if (!content?.trim()) errors.push('content is required');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};

// ── Testimonial ──────────────────────────────────────────────────────────────

export const validateTestimonial = (req, res, next) => {
  const { quote, name, role, company, avatarUrl, domain, rating, order, published } = req.body;
  const errors = [];

  if (!quote?.trim()) errors.push('quote is required');
  if (quote?.length > 2000) errors.push('quote must be 2000 characters or fewer');
  if (!name?.trim()) errors.push('name is required');
  if (!role?.trim()) errors.push('role is required');
  if (!company?.trim()) errors.push('company is required');
  if (avatarUrl && !isValidUrl(avatarUrl)) errors.push('avatarUrl must be a valid URL');
  if (domain?.length > 120) errors.push('domain must be 120 characters or fewer');
  if (rating !== undefined && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
    errors.push('rating must be an integer from 1 to 5');
  }
  if (order !== undefined && (!Number.isInteger(Number(order)) || Number(order) < 0)) {
    errors.push('order must be a non-negative integer');
  }
  if (published !== undefined && typeof published !== 'boolean') errors.push('published must be a boolean');

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};

// ── Project Image ─────────────────────────────────────────────────────────────

export const validateImage = (req, res, next) => {
  const { cloudflareId, url, alt, role } = req.body;
  const ROLES = ['hero', 'screenshot', 'diagram', 'thumbnail', 'other'];
  const errors = [];

  if (!cloudflareId?.trim()) errors.push('cloudflareId is required');
  if (!url?.trim()) errors.push('url is required');
  else if (!isValidUrl(url)) errors.push('url must be a valid URL');
  if (!alt?.trim()) errors.push('alt text is required');
  if (alt?.length > 300) errors.push('alt must be 300 characters or fewer');
  if (role && !ROLES.includes(role)) errors.push(`role must be one of: ${ROLES.join(', ')}`);

  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
};
