var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");

var userModelSchema = new Schema({
    _id: String, //email
    deviceGroupId: Number,
    password: String,
});

var User = mongoose.model('User', userModelSchema);

module.exports = User;