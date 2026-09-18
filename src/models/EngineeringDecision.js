import mongoose from 'mongoose';

const engineeringDecisionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  // The question this decision answers — shown as the expandable panel title
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  // One-line summary of the decision taken
  decision: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  // Detailed reasoning in 2–6 sentences
  reasoning: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  // Short tradeoff bullets — what this decision cost
  tradeoffs: {
    type: [String],
    default: [],
  },
  // Controls display order within a project's decision list
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

engineeringDecisionSchema.index({ projectId: 1, order: 1 });

export default mongoose.model('EngineeringDecision', engineeringDecisionSchema);
