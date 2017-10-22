var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventModelSchema = mongoose.Schema({
    deviceID: String,
    time: Date,
    awsKey: String
});

var Event = mongoose.model('Event', eventModelSchema);

module.exports = Event;