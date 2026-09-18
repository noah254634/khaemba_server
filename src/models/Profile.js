import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  fullName: { type: String, default: 'Noah Khaemba', trim: true },
  title: { type: String, default: 'Principal Systems & Ledger Architect', trim: true },
  availability: { type: String, default: 'Available · Nairobi (UTC+3)', trim: true },
  headline: { type: String, default: 'Architecting resilient backends & data-driven platforms.', trim: true },
  bio: { type: String, default: 'Specialising in high-throughput payment rails, edge AI inference, and distributed event streaming topologies designed for fault tolerance and sub-100ms SLAs.', trim: true },
  avatarUrl: { type: String, default: '/noah_portrait.png', trim: true },
  cvUrl: { type: String, default: '', trim: true },
  techStackTag: { type: String, default: 'Go / Kafka / C++', trim: true },
  githubUrl: { type: String, default: 'https://github.com/noah254634', trim: true },
  linkedinUrl: { type: String, default: 'https://www.linkedin.com/in/noah-khaemba/', trim: true },
  email: { type: String, default: 'noahkhaemba290@gmail.com', trim: true },
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);
