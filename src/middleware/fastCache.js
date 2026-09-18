import crypto from 'crypto';

// In-memory cache store: key -> { etag, body, timestamp, contentType }
const cacheStore = new Map();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate lightweight strong ETag hash from buffer or string body.
 */
function generateETag(body) {
  return `"${crypto.createHash('sha256').update(body).digest('hex').substring(0, 16)}"`;
}

/**
 * Express Middleware for sub-millisecond 304 Not Modified responses & in-memory caching.
 * @param {Object} opts
 * @param {number} opts.ttl - Time-to-live in milliseconds (default: 5 mins)
 */
export function fastCache(opts = {}) {
  const ttl = opts.ttl || DEFAULT_TTL_MS;

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = req.originalUrl || req.url;
    const clientETag = req.headers['if-none-match'];
    const cached = cacheStore.get(cacheKey);
    const now = Date.now();

    // 1. Check if valid cache hit exists
    if (cached && (now - cached.timestamp < ttl)) {
      // Set ETag and Cache-Control headers
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

      // FAST PATH: If-None-Match matches ETag -> Return 304 IMMEDIATELY without hitting DB!
      if (clientETag && clientETag === cached.etag) {
        return res.status(304).end();
      }

      // FAST PATH: Return cached payload immediately without hitting DB!
      res.setHeader('Content-Type', cached.contentType || 'application/json; charset=utf-8');
      return res.send(cached.body);
    }

    // 2. Cache miss — intercept res.send to capture body and calculate ETag
    const originalSend = res.send.bind(res);

    res.send = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode === 200 && body) {
        try {
          const stringBody = typeof body === 'string' ? body : JSON.stringify(body);
          const etag = generateETag(stringBody);

          res.setHeader('ETag', etag);
          res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');

          cacheStore.set(cacheKey, {
            etag,
            body: stringBody,
            contentType: res.getHeader('Content-Type') || 'application/json; charset=utf-8',
            timestamp: Date.now(),
          });

          // Check if client header matches the newly calculated ETag
          if (clientETag && clientETag === etag) {
            return res.status(304).end();
          }
        } catch (err) {
          console.error('❌ [fastCache] Error caching response:', err.message);
        }
      }

      return originalSend(body);
    };

    next();
  };
}

/**
 * Clear cache entries. If pattern is provided, clears matching keys.
 * Call this on POST, PATCH, DELETE operations to keep cache fresh.
 */
export function clearCache(pattern = null) {
  if (!pattern) {
    cacheStore.clear();
    console.log('⚡ [fastCache] Cleared all cache entries.');
    return;
  }

  let count = 0;
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      cacheStore.delete(key);
      count++;
    }
  }
  console.log(`⚡ [fastCache] Cleared ${count} cache entries matching "${pattern}".`);
}
