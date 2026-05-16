const Movie = require("../models/Movie");
const { isValidObjectId, getOwnedList } = require("../utils/ownership");

async function listMovies(req, res, next) {
  try {
    const { listId } = req.params;
    const list = await getOwnedList(listId, req.user._id);
    if (!list) return res.status(404).json({ error: { message: "List not found" } });

    const { status, q } = req.query;
    const filter = { list: listId };
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
    const { listId } = req.params;
    const list = await getOwnedList(listId, req.user._id);
    if (!list) return res.status(404).json({ error: { message: "List not found" } });

    const { title, year, genre, rating, status, notes } = req.body || {};
    const created = await Movie.create({
      list: listId,
      title,
      year,
      genre,
      rating,
      status,
      notes
    });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err?.name === "ValidationError") err.status = 400;
    next(err);
  }
}

async function getMovie(req, res, next) {
  try {
    const { listId, id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const list = await getOwnedList(listId, req.user._id);
    if (!list) return res.status(404).json({ error: { message: "List not found" } });

    const movie = await Movie.findOne({ _id: id, list: listId }).lean();
    if (!movie) return res.status(404).json({ error: { message: "Movie not found" } });
    res.json({ data: movie });
  } catch (err) {
    next(err);
  }
}

async function updateMovie(req, res, next) {
  try {
    const { listId, id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const list = await getOwnedList(listId, req.user._id);
    if (!list) return res.status(404).json({ error: { message: "List not found" } });

    const patch = { ...(req.body || {}) };
    delete patch.list;

    const updated = await Movie.findOneAndUpdate({ _id: id, list: listId }, patch, {
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
    const { listId, id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: { message: "Invalid movie id" } });
    }

    const list = await getOwnedList(listId, req.user._id);
    if (!list) return res.status(404).json({ error: { message: "List not found" } });

    const deleted = await Movie.findOneAndDelete({ _id: id, list: listId });
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
