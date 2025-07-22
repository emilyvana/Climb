const mongoose = require('mongoose');
const { Schema } = mongoose;

const LocationSchema = new Schema({
  gym: { 
    type: String,
    required: true },
  city: {
    type: String,
    required: true,
  },
 wall: {
    type: Schema.Types.ObjectId,
    ref: 'Wall',
    required: false,  // optional 
  }
});
LocationSchema.virtual('url').get(function () {
  return '/catalog/location/' + this._id;
});

 // need to name gym, maybe wall
const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;
