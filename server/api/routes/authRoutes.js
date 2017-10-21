var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var express = require("express");

var router = express.Router();

var auth_controller = require("../controllers/authControllers.js");

module.exports = function(app) {
    app.use( bodyParser.json() );     

    app.get("/api/auth/verifyEmail", auth_controller.verify_email);

    app.post("/api/auth/token", auth_controller.token);

    app.post("/api/auth/registerUser", auth_controller.register_user);
};

//reset password
//log out