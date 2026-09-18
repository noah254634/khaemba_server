import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'OVERVIEW',
      'PROBLEM',
      'ARCHITECTURE',
      'ENGINEERING_DECISION',
      'TECH_STACK',
      'IMPLEMENTATION',
      'METRICS',
      'LESSON',
    ],
    required: true,
  },
  title: { type: String, trim: true, default: '' },
  content: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  longDescription: { type: String, default: '' },

  stack: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technology',
  }],

  sections: { type: [sectionSchema], default: [] },

  category: {
    type: String,
    enum: ['infra', 'data', 'payments', 'ml', 'other'],
    default: 'other',
  },

  githubUrl: { type: String, default: '', trim: true },
  liveUrl:   { type: String, default: '', trim: true },

  status: {
    type: String,
    enum: ['LIVE', 'BUILDING', 'TESTING', 'PROTOTYPE', 'ARCHIVED'],
    default: 'BUILDING',
  },

  featured: { type: Boolean, default: false },
  metrics: { type: [metricSchema], default: [] },
  order: { type: Number, default: 0 },
}, { timestamps: true });

projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ category: 1, featured: -1, order: 1 });

export default mongoose.model('Project', projectSchema);
