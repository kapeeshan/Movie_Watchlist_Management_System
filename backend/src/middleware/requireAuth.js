const User = require("../models/User");
const { verifyToken } = require("../utils/tokens");

function requireAuth(jwtSecret) {
  return async function authMiddleware(req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const [scheme, token] = header.split(" ");
      if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: { message: "Authentication required" } });
      }

      let payload;
      try {
        payload = verifyToken(token, jwtSecret);
      } catch {
        return res.status(401).json({ error: { message: "Invalid or expired token" } });
      }

      const user = await User.findById(payload.sub).lean();
      if (!user) {
        return res.status(401).json({ error: { message: "User not found" } });
      }

      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAuth };
