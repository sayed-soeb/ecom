const mongoose = require('mongoose');

const storeInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  address: String,
  gst: String,
  logo: String,
  storeTimings: String
});

module.exports = mongoose.model('StoreInfo', storeInfoSchema);
