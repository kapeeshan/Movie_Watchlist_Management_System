const express = require("express");
const {
  listMovies,
  createMovie,
  getMovie,
  updateMovie,
  deleteMovie
} = require("../controllers/moviesController");

const router = express.Router();

router.get("/", listMovies);
router.post("/", createMovie);
router.get("/:id", getMovie);
router.patch("/:id", updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;

