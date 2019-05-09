var mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

var UserSchema = new mongoose.Schema({
  _id: Number,
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  created_at: Date,
  updated_at: Date,
}, { _id: false });

// mongoose.model('User', UserSchema);
UserSchema.plugin(AutoIncrement);

module.exports = mongoose.model('User', UserSchema);