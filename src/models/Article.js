import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  // Full article content — Markdown or plain text
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Pre-save: auto-set publishedAt when first published
articleSchema.pre('save', function (next) {
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

articleSchema.index({ published: 1, publishedAt: -1 });
articleSchema.index({ title: 'text', excerpt: 'text' });

export default mongoose.model('Article', articleSchema);
