var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventModelSchema = mongoose.Schema({
    eventID: String,
    groupID: String,
    time: Date,
    awsKey: String
});

var Event = mongoose.model('Event', eventModelSchema);

module.exports = Event;