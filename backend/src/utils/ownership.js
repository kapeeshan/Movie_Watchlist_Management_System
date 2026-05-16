const mongoose = require("mongoose");
const Watchlist = require("../models/Watchlist");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function getOwnedList(listId, userId) {
  if (!isValidObjectId(listId)) return null;
  return Watchlist.findOne({ _id: listId, user: userId }).lean();
}

module.exports = { isValidObjectId, getOwnedList };
