import mongoose from 'mongoose';

const projectImageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  alt: {
    type: String,
    default: '',
    trim: true,
    maxlength: 300,
  },
  caption: {
    type: String,
    default: '',
    trim: true,
  },
  role: {
    type: String,
    enum: ['screenshot', 'diagram', 'hero', 'other'],
    default: 'screenshot',
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

projectImageSchema.index({ projectId: 1, order: 1 });

const ProjectImage = mongoose.model('ProjectImage', projectImageSchema);

// Drop legacy indexes from past schema iterations to prevent E11000 duplicate key errors
ProjectImage.collection.dropIndex('cloudflareId_1').catch(() => {});
mongoose.connection.on('connected', () => {
  ProjectImage.collection.dropIndex('cloudflareId_1').catch(() => {});
});

export default ProjectImage;
