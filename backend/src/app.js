const express = require("express");
const cors = require("cors");

const { requireAuth } = require("./middleware/requireAuth");
const { createAuthRoutes } = require("./routes/authRoutes");
const { createWatchlistsRoutes } = require("./routes/watchlistsRoutes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");

function createApp({ corsOrigin, jwtSecret, jwtExpiresIn }) {
  const app = express();
  const auth = requireAuth(jwtSecret);

  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use(
    "/api/auth",
    createAuthRoutes({ jwtSecret, jwtExpiresIn, requireAuth: auth })
  );
  app.use("/api/lists", createWatchlistsRoutes(auth));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
