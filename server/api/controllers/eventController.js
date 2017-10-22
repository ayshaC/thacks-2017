var Guid = require("guid");
var mongoose = require('mongoose');
var Event = require('../models/event');

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
    var token = request.header.authorization;
    var decodedToken = jwt.verify(token, config.hmacsecret);
    var username = decodedToken.sub;
    var startTime = new Date(request.body.startTime);
    var endTime = new Date(request.body.endTime);
    var groupId = 0;
    User.find({username: username}, function(err, doc){
        if(err){
            response.status(502).send();
        }else{
            groupId = doc.groupID;
            Event.find({
                time:{
                    $gte: startTime,
                    $lt: endTime
                },
                groupID: groupId
            }, function(err, docs){
                if(err){
                    response.status(502).send();
                }else{
                    return docs;
                }
            })
        }
    })
}