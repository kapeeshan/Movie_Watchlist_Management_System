require("dotenv").config();

const { createApp } = require("./app");
const { connectDb } = require("./config/db");
const { PORT, MONGODB_URI, CORS_ORIGIN } = require("./config/env");

async function start() {
  await connectDb(MONGODB_URI);

  const app = createApp({ corsOrigin: CORS_ORIGIN });
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});

