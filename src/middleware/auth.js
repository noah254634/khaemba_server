import jwt from 'jsonwebtoken';

/** API key guard — kept for backwards compat */
export const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
};

/**
 * JWT Bearer token guard.
 * Expects: Authorization: Bearer <token>
 * Attaches decoded payload to req.admin on success.
 */
export const requireJwt = (req, res, next) => {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authorization token required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    return res.status(401).json({ success: false, error: message });
  }
};