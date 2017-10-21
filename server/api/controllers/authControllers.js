var User = require('../models/user');
var config = require('../../config/config');
var nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');
var bcrypt = require("bcryptjs");


exports.token = function(request, response) {
};

exports.register_user = function(request, response) {
    var email = request.body.email;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;  //check validity of email address
    var result = re.test(email);
    if (!result) {
        response.status(400).send("Invalid Email Provided");
    } else {
        console.log("valid email")
        User.find({email:email}, function(err, user) {
            if (user==null) {
                var _password = request.body.password;
                var _name = request.body.name;
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                var _confirmationCode = "";
                for (var i = 0; i < 32; i++)
                    _confirmationCode += possible.charAt(Math.floor(Math.random() * possible.length));
                var expiryDate = new Date(+new Date() + 10000);
                var newUser = User({
                    _id: email,
                    name: _name,
                    password: _password,
                    salt: "temp",
                    isConfirmed: false,
                    confirmationCode: _confirmationCode,
                    confirmationExpiryDate: expiryDate
                });

                newUser.save(function(err) {
                    if (err) throw err;

                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: config.emailusername,
                            pass: config.emailpassword
                        }
                       });
                    
                    var mailOptions = {
                        from: 'reviewshare1@gmail.com',
                        to: email,
                        subject: 'Your Review Share Confirmation',
                        text: "To confirm your email, click the following link: " + config.domainname + "/api/auth/verifyEmail?confirmation="+_confirmationCode+"&userid="+email
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    response.status(200).send("Success");
                });
            } else {
                console.log(user);
                response.status(409).send("User already exists");
            }
        });
    }
}

exports.verify_email = function(request, response) {
    var _confirmationCode = request.query.confirmation;
    var id = request.query.userid;
    User.findById(id, function(err,user){
        if(user==null){
            response.status(401).send("No user with that ID found");
        }else if(user.isConfirmed){
            response.status(409).send("User is already confirmed");
        }else if (user.confirmationCode!=_confirmationCode){
            response.status(400).send("Invalid confirmation code");
        }else{
            user.confirmationCode = null;
            user.isConfirmed = true;
            user.confirmationExpiryDate = new Date(8640000000000000); //latest date possible
        }
        user.save(function(err){
            if(err) throw err;
            response.status(200).send("User validated");
        });
    })
}