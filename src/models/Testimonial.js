import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  quote: { type: String, required: true, trim: true, maxlength: 2000 },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 160 },
  company: { type: String, required: true, trim: true, maxlength: 160 },
  avatarUrl: { type: String, default: '', trim: true },
  domain: { type: String, default: '', trim: true, maxlength: 120 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
}, { timestamps: true });

testimonialSchema.index({ published: 1, order: 1, createdAt: -1 });

export default mongoose.model('Testimonial', testimonialSchema);
