const express = require("express");
const {
  listWatchlists,
  createWatchlist,
  getWatchlist,
  updateWatchlist,
  deleteWatchlist
} = require("../controllers/watchlistsController");
const {
  listMovies,
  createMovie,
  getMovie,
  updateMovie,
  deleteMovie
} = require("../controllers/moviesController");

function createWatchlistsRoutes(requireAuth) {
  const router = express.Router();

  router.use(requireAuth);

  router.get("/", listWatchlists);
  router.post("/", createWatchlist);
  router.get("/:listId", getWatchlist);
  router.patch("/:listId", updateWatchlist);
  router.delete("/:listId", deleteWatchlist);

  router.get("/:listId/movies", listMovies);
  router.post("/:listId/movies", createMovie);
  router.get("/:listId/movies/:id", getMovie);
  router.patch("/:listId/movies/:id", updateMovie);
  router.delete("/:listId/movies/:id", deleteMovie);

  return router;
}

module.exports = { createWatchlistsRoutes };
