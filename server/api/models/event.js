var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventModelSchema = new Schema({
    _id: ObjectId,
    timestamp: Date,
    deviceId: ObjectId,
    clipAddress:     
});

var Event = mongoose.model('Event', eventModelSchema);

module.exports = Event;