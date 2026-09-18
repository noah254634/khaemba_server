import Admin from "../models/admin.js";
import { authService } from "../services/authService.js";

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });

      const result = await authService.login(email, password);
      if (!result)
        return res.status(401).json({ message: "Invalid credentials" });

      return res.json({
        success: true,
        token: result.token,
        admin: result.admin,
      });
    } catch (error) {
      console.error("[auth] login error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "All fields are required" });
      const result = await authService.createAdmin(email, password);
      if (!result)
        return res.status(401).json({ message: "Invalid credentials" });
      return res.json({
        success: true,
        token: result.token,
        admin: result.admin,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      console.error("[auth] register error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getMe: async (req, res) => {
    try {
      const admin = await Admin.findById(req.admin.id).select("-password");
      return res.json({
        success: true,
        admin,
      });
    } catch (error) {
      console.error("[auth] getMe error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  logout: async (req, res) => {
    try {
      return res.json({

        success: true,
      });
    } catch (error) {
      console.error("[auth] logout error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  session: async (req, res) => {
    try {
      return res.json({
        success: true,
        admin: req.admin,
      });
    } catch (error) {
      console.error("[auth] session error:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAdmins: async (req, res) => {
    try {
      const admins = await Admin.find().select("-password");
      return res.json({
        success: true,
        admins,
      });
    } catch (err) {
      console.error("[auth] getAdmins error:", err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};