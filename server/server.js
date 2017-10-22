var express = require("express");
var mongoose = require("mongoose");
var app = express();
var config = require('./config/config');
var port = config.port;

var mongoose = require('mongoose');
mongoose.connect(config.mongodbconnectionstring);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require("./api/routes/authRoutes.js")(app);
require("./api/routes/eventRoutes.js")(app);

app.listen(port, function() {
    console.log("Node server is running at localhost:" + port);
});