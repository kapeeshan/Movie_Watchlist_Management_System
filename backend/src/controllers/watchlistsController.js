const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");
const { isValidObjectId } = require("../utils/ownership");

async function listWatchlists(req, res, next) {
  try {
    const lists = await Watchlist.find({ user: req.user._id }).sort({ createdAt: 1 }).lean();
    res.json({ data: lists });
  } catch (err) {
    next(err);
  }
}

async function createWatchlist(req, res, next) {
  try {
    const { name, description } = req.body || {};
    const trimmedName = String(name || "").trim();
    if (!trimmedName) {
      return res.status(400).json({ error: { message: "List name is required" } });
    }

    const created = await Watchlist.create({
      user: req.user._id,
      name: trimmedName,
      description: description?.trim() || undefined
    });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: { message: "A list with this name already exists" } });
    }
    if (err?.name === "ValidationError") err.status = 400;
    next(err);
  }
}

async function getWatchlist(req, res, next) {
  try {
    const { listId } = req.params;
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ error: { message: "Invalid list id" } });
    }

    const list = await Watchlist.findOne({ _id: listId, user: req.user._id }).lean();
    if (!list) return res.status(404).json({ error: { message: "List not found" } });
    res.json({ data: list });
  } catch (err) {
    next(err);
  }
}

async function updateWatchlist(req, res, next) {
  try {
    const { listId } = req.params;
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ error: { message: "Invalid list id" } });
    }

    const { name, description } = req.body || {};
    const patch = {};
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({ error: { message: "List name cannot be empty" } });
      }
      patch.name = trimmedName;
    }
    if (description !== undefined) patch.description = description?.trim() || "";

    const updated = await Watchlist.findOneAndUpdate({ _id: listId, user: req.user._id }, patch, {
      new: true,
      runValidators: true
    });

    if (!updated) return res.status(404).json({ error: { message: "List not found" } });
    res.json({ data: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: { message: "A list with this name already exists" } });
    }
    if (err?.name === "ValidationError") err.status = 400;
    next(err);
  }
}

async function deleteWatchlist(req, res, next) {
  try {
    const { listId } = req.params;
    if (!isValidObjectId(listId)) {
      return res.status(400).json({ error: { message: "Invalid list id" } });
    }

    const deleted = await Watchlist.findOneAndDelete({ _id: listId, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: { message: "List not found" } });

    await Movie.deleteMany({ list: listId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listWatchlists,
  createWatchlist,
  getWatchlist,
  updateWatchlist,
  deleteWatchlist
};
