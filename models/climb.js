const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClimbSchema = new Schema({
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true },
  wall: { type: Schema.Types.ObjectId, ref: "Wall", required: false },
  gradeclimb: { type: Number, required: true }, //  actual grade
  notes: { type: String },
  climbDate: { type: Date, default: Date.now },
});

ClimbSchema.virtual("url").get(function () {
  return "/catalog/climb/" + this._id;
});

module.exports = mongoose.model("Climb", ClimbSchema);
