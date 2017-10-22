var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");

var router = express.Router();

var auth_controller = require("../controllers/authControllers.js");

module.exports = function(app) {
    app.use( bodyParser.json() );     

    app.post("/api/auth/token", auth_controller.token);

};

//reset password
//log out