const mongoose = require('mongoose');
const { Schema } = mongoose;

const WallSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['overhang', 'cave', 'slab',  'island'],  // 4 walls at LBR? may need more
  },
  description: {
    type: String,
    required: false,  //can add specific route details
  },
    name: {
    type: String,
    required: false,  //gotta name the wall
  },
});

WallSchema.virtual('url').get(function () { ////add the url
  return '/catalog/wall/' + this._id;
});

const Wall = mongoose.model('Wall', WallSchema);

module.exports = Wall;
