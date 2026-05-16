const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    list: { type: mongoose.Schema.Types.ObjectId, ref: "Watchlist", required: true, index: true },
    title: { type: String, required: true, trim: true },
    year: { type: Number, min: 1800, max: 3000 },
    genre: { type: String, trim: true },
    rating: { type: Number, min: 0, max: 10 },
    status: {
      type: String,
      enum: ["planned", "watching", "completed"],
      default: "planned"
    },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);
