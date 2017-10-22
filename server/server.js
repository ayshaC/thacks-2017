var express = require("express");
var mongoose = require("mongoose");
var app = express();
var config = require('./config/config');
var port = config.port;
var Guid = require("guid");

var mongoose = require('mongoose');
mongoose.connect(config.mongodbconnectionstring);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require("./api/routes/authRoutes.js")(app);

var Event = require('./api/models/event');

app.use(function (error, request, response, next) {
    console.error(error.stack);
    response.status(400).send(error.message);
});

app.listen(port, function() {
    console.log("Node server is running at localhost:" + port);
});


app.post("/addEvent", function(request,response){
    var guid = Guid.create();
    var device = request.body.id;
    var timeStamp = request.body.time;
    var s3key = request.body.key;
    
    var newEvent = new Event({
        eventID: guid,
        deviceID: device,
        time: timeStamp,
        awsKey: s3key
    });
    newEvent.save(function(err, Event) {
        if (err){
            console.log("ERROR: EVENT CANNOT BE SAVED")
            response.status(502).send();
        }
        response.status(201).send();
    });

 });