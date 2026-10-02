import AnalyticsVisit from '../models/AnalyticsVisit.js';
import { parseUserAgent, getGeoLocation } from '../helpers/analyticsHelper.js';

/**
 * Public Endpoint: Logs a visitor pageview
 */
export const trackVisit = async (req, res) => {
  try {
    const { sessionId, path = '/', referrer = 'Direct', durationSeconds = 0 } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    const userAgent = req.headers['user-agent'] || '';
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const geo = await getGeoLocation(req);

    // Check if visit already exists for this session & path within the last 12h
    const existing = await AnalyticsVisit.findOne({
      sessionId,
      path,
      createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    });

    if (existing) {
      if (durationSeconds > existing.durationSeconds) {
        existing.durationSeconds = durationSeconds;
        await existing.save();
      }
      return res.json({ success: true, visitId: existing._id });
    }

    const newVisit = await AnalyticsVisit.create({
      sessionId,
      path,
      deviceType,
      browser,
      os,
      ip: geo.ip || '',
      country: geo.country || 'Unknown',
      countryCode: geo.countryCode || 'XX',
      city: geo.city || 'Unknown',
      durationSeconds: Number(durationSeconds) || 0,
      referrer: referrer || 'Direct',
      userAgent,
    });

    res.status(201).json({ success: true, visitId: newVisit._id });
  } catch (err) {
    console.error('❌ [Analytics Track Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Public Endpoint: Updates duration time spent for an active session
 */
export const heartbeat = async (req, res) => {
  try {
    const { sessionId, durationSeconds = 0 } = req.body;
    if (!sessionId) return res.status(400).json({ success: false });

    await AnalyticsVisit.updateMany(
      { sessionId },
      { $max: { durationSeconds: Number(durationSeconds) || 0 } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Admin Endpoint: Aggregates analytics dashboard telemetry
 */
export const getStats = async (req, res) => {
  try {
    const timeframeDays = Number(req.query.days) || 30;
    const sinceDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000);

    const matchQuery = { createdAt: { $gte: sinceDate } };

    // Total pageviews & distinct session count
    const [totalVisits, uniqueSessions, avgDurationResult] = await Promise.all([
      AnalyticsVisit.countDocuments(matchQuery),
      AnalyticsVisit.distinct('sessionId', matchQuery),
      AnalyticsVisit.aggregate([
        { $match: matchQuery },
        { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' } } },
      ]),
    ]);

    const uniqueVisitors = uniqueSessions.length;
    const avgDuration = Math.round(avgDurationResult[0]?.avgDuration || 0);

    // Device breakdown
    const deviceAggregate = await AnalyticsVisit.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    deviceAggregate.forEach((d) => {
      if (d._id) devices[d._id] = d.count;
    });

    // Top Countries & Cities
    const topLocations = await AnalyticsVisit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { country: '$country', countryCode: '$countryCode', city: '$city' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    // Top Browsers
    const topBrowsers = await AnalyticsVisit.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Top OS
    const topOS = await AnalyticsVisit.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Top Pages
    const topPages = await AnalyticsVisit.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Recent Live Visitors Log
    const recentVisits = await AnalyticsVisit.find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    res.json({
      success: true,
      data: {
        summary: {
          totalVisits,
          uniqueVisitors,
          avgDuration,
          timeframeDays,
        },
        devices,
        topLocations: topLocations.map((loc) => ({
          country: loc._id.country,
          countryCode: loc._id.countryCode,
          city: loc._id.city,
          count: loc.count,
        })),
        topBrowsers: topBrowsers.map((b) => ({ browser: b._id, count: b.count })),
        topOS: topOS.map((o) => ({ os: o._id, count: o.count })),
        topPages: topPages.map((p) => ({ path: p._id, count: p.count })),
        recentVisits,
      },
    });
  } catch (err) {
    console.error('❌ [Analytics Stats Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Admin Endpoint: Deletes a specific visitor log entry by ID
 */
export const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AnalyticsVisit.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Visit log entry not found' });
    }
    res.json({ success: true, message: 'Visitor device log entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Admin Endpoint: Deletes all visit logs for a specific device type (mobile/desktop/tablet)
 */
export const deleteVisitsByDevice = async (req, res) => {
  try {
    const { deviceType } = req.params;
    const result = await AnalyticsVisit.deleteMany({ deviceType });
    res.json({
      success: true,
      count: result.deletedCount,
      message: `Deleted ${result.deletedCount} ${deviceType} logs`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
