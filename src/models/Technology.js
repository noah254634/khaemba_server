import mongoose from 'mongoose';

const technologySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Simple string icon identifier — e.g. 'go', 'postgres', 'kafka'
  // Frontend maps this to an SVG/logo. Keeps the model lightweight.
  icon: { type: String, default: '' },
  category: {
    type: String,
    enum: ['language', 'database', 'queue', 'infra', 'framework', 'protocol', 'cloud', 'other'],
    default: 'other',
  },
  color: { type: String, default: '' }, // hex color for language dots, etc.
}, { timestamps: true });

technologySchema.index({ category: 1, name: 1 });

export default mongoose.model('Technology', technologySchema);
