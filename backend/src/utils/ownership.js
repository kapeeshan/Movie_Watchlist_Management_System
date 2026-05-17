const mongoose = require("mongoose");
const Watchlist = require("../models/Watchlist");

function isValidObjectId(id) {
  if (!id || typeof id !== "string") return false;
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  return String(new mongoose.Types.ObjectId(id)) === id;
}

async function getOwnedList(listId, userId) {
  if (!isValidObjectId(listId)) return null;
  return Watchlist.findOne({ _id: listId, user: userId }).lean();
}

module.exports = { isValidObjectId, getOwnedList };
