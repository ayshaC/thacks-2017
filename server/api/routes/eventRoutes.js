var bodyParser = require("body-parser");
var events_controller = require("../controllers/eventController.js");
var jwt = require('jsonwebtoken');
var config = require('../../config/config');

module.exports = function(app) {
    app.post("/api/addEvent", events_controller.add_event);
    app.use('/api', function (req, res, next) {
        var token = req.headers.authorization;
        token = token.replace("Bearer ", "");
        jwt.verify(token, config.hmacsecret, function(err,decoded){
            if(err){
                res.status(401).send();
            }
        });
        next();
    });
    app.use(bodyParser.json());    
    app.get("/api/getEvents", events_controller.get_events);
    app.get("/api/getEvent", events_controller.get_event);
};