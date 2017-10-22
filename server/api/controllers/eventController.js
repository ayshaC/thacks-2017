var User = require('../models/user');
var Guid = require("guid");
var mongoose = require('mongoose');
var Event = require('../models/event');
var jwt = require('jsonwebtoken');
var config = require('../../config/config.js')

exports.add_event = function(request,response){
    var guid = Guid.create();
    var group = request.body.groupid;
    var timeStamp = Date.now();
    var s3key = request.body.key;
    
    var newEvent = new Event({
        eventID: guid,
        groupID: group,
        time: timeStamp,
        awsKey: s3key
    });
    console.log(newEvent);
    newEvent.save(function(err, Event) {
        if (err){
            console.log("ERROR: EVENT CANNOT BE SAVED")
            response.status(502).send();
        }
        response.status(201).send(Event);
    });
}

exports.get_event = function(request,response){
    var eventId = request.query.eventid;
    console.log(eventId);
    Event.find({eventID: eventId}, function(err,document){
        if(err){
            console.log(err);
            response.status(502).send();
        }else{
            response.status(200).send(document);
        }
    })
}

exports.get_events = function(request,response){
    var token = request.headers.authorization;
    token = token.replace("Bearer ", "");
    var decodedToken = jwt.verify(token, config.hmacsecret);
    var username = decodedToken.sub;
    var groupId = 0;
    User.find({username: username}, function(err, doc){
        if(err){
            console.log(err);
            response.status(502).send();
        }else{
            groupId = doc.groupID;
            Event.find({
                groupId: groupId  
            }, function(err, docs){
                if(err){
                    console.log(err);
                    response.status(502).send();
                }else{
                    response.status(200).send(docs);
                }
            })
        }
    })
}