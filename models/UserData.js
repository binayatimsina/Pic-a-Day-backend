const mongoose = require('mongoose');

const userDataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  imageURL: { type: String, required: true },
  note: {type: String},
  date: {type: String, default: new Date().toISOString().split('T')[0]},
});

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;
