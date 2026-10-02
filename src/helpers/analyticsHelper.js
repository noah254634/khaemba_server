import fetch from 'node-fetch';

/**
 * Parses User-Agent header to determine browser, OS, and device type
 */
export function parseUserAgent(uaString = '') {
  const ua = uaString.toLowerCase();
  let deviceType = 'desktop';
  let browser = 'Other';
  let os = 'Other';

  // Device Type detection
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(uaString)) {
    deviceType = 'mobile';
  } else if (/ipad|tablet|android(?!.*mobile)/i.test(uaString)) {
    deviceType = 'tablet';
  }

  // OS detection
  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/mac os x|macintosh/i.test(uaString)) os = 'macOS';
  else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/linux/i.test(uaString)) os = 'Linux';

  // Browser detection
  if (/edg/i.test(uaString)) browser = 'Edge';
  else if (/chrome|crios/i.test(uaString) && !/edg/i.test(uaString)) browser = 'Chrome';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Safari';
  else if (/firefox|fxios/i.test(uaString)) browser = 'Firefox';
  else if (/opera|opr/i.test(uaString)) browser = 'Opera';

  return { deviceType, browser, os };
}

/**
 * Resolves Geolocation info (Country, City, Country Code) from HTTP headers or IP API
 */
export async function getGeoLocation(req) {
  // Check Vercel / Cloudflare Headers
  const headerCountry = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'];
  const headerCity = req.headers['x-vercel-ip-city'];

  if (headerCountry) {
    return {
      country: headerCountry === 'US' ? 'United States' : headerCountry,
      countryCode: (headerCountry || 'XX').toUpperCase(),
      city: headerCity ? decodeURIComponent(headerCity) : 'Unknown',
    };
  }

  // Extract client IP address
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';

  const cleanIp = rawIp.replace(/^::ffff:/, '');

  if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return {
      country: 'Localhost',
      countryCode: 'LOCAL',
      city: 'Development',
      ip: '127.0.0.1',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,countryCode,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        return {
          country: data.country || 'Unknown',
          countryCode: (data.countryCode || 'XX').toUpperCase(),
          city: data.city || 'Unknown',
          ip: cleanIp,
        };
      }
    }
  } catch (err) {
    // GeoIP lookup timeout or network failure fallback
  }

  return {
    country: 'Unknown',
    countryCode: 'XX',
    city: 'Unknown',
    ip: cleanIp,
  };
}
