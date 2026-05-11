const mongoose = require("mongoose");
const Movie = require("../models/Movie");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function listMovies(req, res, next) {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (q) filter.title = { $regex: String(q), $options: "i" };

    const movies = await Movie.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ data: movies });
  } catch (err) {
    next(err);
  }
}

async function createMovie(req, res, next) {
  try {
    const { title, year, genre, rating, status, notes } = req.body || {};
    const created = await Movie.create({ title, year, genre, rating, status, notes });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err?.name === "ValidationError") err.status = 400;
    next(err);
  }
}

async function getMovie(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const movie = await Movie.findById(id).lean();
    if (!movie) return res.status(404).json({ error: { message: "Movie not found" } });
    res.json({ data: movie });
  } catch (err) {
    next(err);
  }
}

async function updateMovie(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const patch = req.body || {};
    const updated = await Movie.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ error: { message: "Movie not found" } });
    res.json({ data: updated });
  } catch (err) {
    if (err?.name === "ValidationError") err.status = 400;
    next(err);
  }
}

async function deleteMovie(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: { message: "Movie not found" } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMovies,
  createMovie,
  getMovie,
  updateMovie,
  deleteMovie
};

