var express = require("express");
var mongoose = require("mongoose");
var app = express();
var config = require('./config/config');
var port = config.port;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost');
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
    var device = request.body.id;
    var timeStamp = request.body.time;
    var s3key = request.body.key;

    var newEvent = new Event({
        deviceID: device,
        time: timeStamp,
        awsKey: s3key
    });

    newEvent.save(function(err, Event) {
        if (err) return console.error("didnt save something wrong yo")
    });

 });