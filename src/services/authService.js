import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

const JWT_EXPIRY = '7d';

export const authService = {
  /**
   * Verify credentials and return a signed JWT.
   * Returns null if the user doesn't exist or the password is wrong.
   */
  async login(email, password) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return null;

    const valid = await admin.verifyPassword(password);
    if (!valid) return null;

    const token = jwt.sign(
      { sub: admin._id.toString(), email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    return { token, admin: admin.toSafeObject() };
  },

  /** Create a new admin with hashed password and signed JWT token. */
  async createAdmin(email, password) {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    const admin = new Admin({ email: email.toLowerCase().trim(), password });
    await admin.save(); // triggers bcrypt pre-save hook

    const token = jwt.sign(
      { sub: admin._id.toString(), email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    return { token, admin: admin.toSafeObject() };
  },

  async getAdmin(email) {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    return admin ? admin.toSafeObject() : null;
  },

  async getAdmins() {
    const admins = await Admin.find().lean();
    return admins.map(({ _id, email, createdAt }) => ({ id: _id, email, createdAt }));
  },

  async deleteAdmin(email) {
    return Admin.deleteOne({ email: email.toLowerCase().trim() });
  },

  async updateAdmin(email, newPassword) {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return null;
    admin.password = newPassword; // pre-save hook will hash it
    await admin.save();
    return admin.toSafeObject();
  },
};
