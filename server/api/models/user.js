var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");

var reviewModelSchema = new Schema({
    date: Date,
    location: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
    },
    rating: Number,
    reviewText: String
});

var userModelSchema = new Schema({
    _id: String,//email
    name: String,
    password: String, //salt and hash
    listOfFriends: [String], //ids (email)
    pendingFriendRequests: [String],
    isConfirmed: Boolean,
    confirmationCode: String, 
    reviews: [reviewModelSchema],
    confirmationExpiryDate: {type: Date} //expires an hour after this date
});

userModelSchema.pre('save', function(next) {
    var salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    
    next();
});

var User = mongoose.model('User', userModelSchema);

module.exports = User;