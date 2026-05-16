const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Watchlist = require("../models/Watchlist");
const { signToken } = require("../utils/tokens");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    _id: user._id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function createAuthController({ jwtSecret, jwtExpiresIn }) {
  async function register(req, res, next) {
    try {
      const { email, password, displayName } = req.body || {};
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      if (!EMAIL_RE.test(normalizedEmail)) {
        return res.status(400).json({ error: { message: "Valid email is required" } });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: { message: "Password must be at least 6 characters" } });
      }

      const existing = await User.findOne({ email: normalizedEmail }).lean();
      if (existing) {
        return res.status(409).json({ error: { message: "Email already registered" } });
      }

      const passwordHash = await bcrypt.hash(String(password), 10);
      const user = await User.create({
        email: normalizedEmail,
        passwordHash,
        displayName: displayName?.trim() || undefined
      });

      await Watchlist.create({
        user: user._id,
        name: "My Watchlist",
        description: "Default list"
      });

      const token = signToken(user._id, jwtSecret, jwtExpiresIn);
      res.status(201).json({ data: { user: publicUser(user), token } });
    } catch (err) {
      if (err?.code === 11000) {
        return res.status(409).json({ error: { message: "Email already registered" } });
      }
      next(err);
    }
  }

  async function login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const normalizedEmail = String(email || "")
        .trim()
        .toLowerCase();

      const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
      if (!user) {
        return res.status(401).json({ error: { message: "Invalid email or password" } });
      }

      const ok = await bcrypt.compare(String(password || ""), user.passwordHash);
      if (!ok) {
        return res.status(401).json({ error: { message: "Invalid email or password" } });
      }

      const token = signToken(user._id, jwtSecret, jwtExpiresIn);
      res.json({ data: { user: publicUser(user), token } });
    } catch (err) {
      next(err);
    }
  }

  async function me(req, res) {
    res.json({ data: publicUser(req.user) });
  }

  return { register, login, me };
}

module.exports = { createAuthController };
