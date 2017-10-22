var bodyParser = require("body-parser");
var auth_controller = require("../controllers/authControllers.js");

module.exports = function(app) {
    app.use(bodyParser.json());     
    app.post("/auth/token", auth_controller.token);
};