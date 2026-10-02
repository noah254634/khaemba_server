import mongoose from 'mongoose';

const analyticsVisitSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    path: { type: String, default: '/', trim: true },
    deviceType: { type: String, default: 'desktop', enum: ['desktop', 'mobile', 'tablet'] },
    browser: { type: String, default: 'Unknown' },
    os: { type: String, default: 'Unknown' },
    ip: { type: String, default: '' },
    country: { type: String, default: 'Unknown' },
    countryCode: { type: String, default: 'XX' },
    city: { type: String, default: 'Unknown' },
    durationSeconds: { type: Number, default: 0, min: 0 },
    referrer: { type: String, default: 'Direct' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

analyticsVisitSchema.index({ createdAt: -1 });
analyticsVisitSchema.index({ country: 1 });
analyticsVisitSchema.index({ deviceType: 1 });

export default mongoose.model('AnalyticsVisit', analyticsVisitSchema);
