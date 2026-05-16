const express = require("express");
const { createAuthController } = require("../controllers/authController");

function createAuthRoutes({ jwtSecret, jwtExpiresIn, requireAuth }) {
  const router = express.Router();
  const { register, login, me } = createAuthController({ jwtSecret, jwtExpiresIn });

  router.post("/register", register);
  router.post("/login", login);
  router.get("/me", requireAuth, me);

  return router;
}

module.exports = { createAuthRoutes };
