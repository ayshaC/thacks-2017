var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userModelSchema = new Schema({
    username: String, //email
    groupId: Number,
    password: String,
});

var User = mongoose.model('User', userModelSchema);

module.exports = User;