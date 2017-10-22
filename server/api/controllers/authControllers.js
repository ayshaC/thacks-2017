var User = require('../models/user');
var config = require('../../config/config');
var jwt = require('jsonwebtoken');


exports.token = function(request, response) {
    var username = request.body.username;
    var password = request.body.password;
    User.find({_id:username, password: password}, function(err,user){
        if(err){
            response.status(502).send();
        }else if(typeof user === "undefined"){
            response.status(401).send();
        }else{
            var token = jwt.sign({expiresIn: "1d", sub:username}, config.hmacsecret);
            var result={};
            result.access_token=token;
            result.expires_in="86400";
            result.token_type="Bearer";
            response.send(result);
        }
    });
};