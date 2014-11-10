// Original code from: https://raw.githubusercontent.com/hubot-scripts/hubot-standup-alarm/master/scripts/standup.js
// Modified by: Matt Warren
// Last Modified: 13/Oct/2014
// Description:
//   Have Hubot remind you to do standups.
//   hh:mm must be in the same timezone as the server Hubot is on. Probably UTC.
//
//   This is configured to work for Hipchat. You may need to change the 'create standup' command
//   to match the adapter you're using.

//
// Commands:
//   hubot standup help - See a help document explaining how to use.
//   hubot create standup hh:mm - Creates a standup at hh:mm every weekday for this room
//   hubot list standups - See all standups for this room
//   hubot list standups in every room - See all standups in every room
//   hubot delete hh:mm standup - If you have a standup at hh:mm, deletes it
//   hubot delete all standups - Deletes all standups for this room.
//
// Dependencies:
//   underscore
//   cron

var standup = exports;
var cronJob = require('cron').CronJob;
var _ = require('underscore');
var fs = require('fs');
var runtimeOptions = require('../config');
var bubo_bot = require('../bubo_bot');

// Constants.
var STANDUP_MESSAGES = [
    "Standup time!",
    "Time for standup, you guys.",
    "It's standup time once again!",
    "Get up, stand up (it's time for our standup)",
    "Standup time. Get up, humans",
    "Standup time! Now! Go go go!",
    "Tweedley-tweedly-tweet! (startrek)"
];
var STANDUP_FILE = runtimeOptions.baseDir + "/standups.json";

var botName = runtimeOptions.mentionName
var clearAllStandups_re = new RegExp(botName + ".*delete all standups", "i");
var deleteOneStandup_re = new RegExp(botName + ".*delete ([0-5]?[0-9]:[0-5]?[0-9]) standup", "i");
var createOneStandup_re = new RegExp(botName + ".*create standup at ([0-5]?[0-9]:[0-5]?[0-9])$", "i");
var listOneStandup_re = new RegExp(botName + ".*list standup(s)?$", "i");
var listAllStandup_re = new RegExp(botName + "(.*list (all )?(the )?standup(s)?|.* list standups (in|from) every room)", "i");
var standupHelp_re = new RegExp(botName + ".*standup help", "i");

// Check for standups that need to be fired, once a minute
// Monday to Friday.
var standupClock = new cronJob('5 * * * * 1-5', function() {
    checkStandups();
}, null, true);

// Compares current time to the time of the standup
// to see if it should be fired.
function standupShouldFire(standupTime) {
    var now = new Date();
    var currentHours = now.getHours();
    var currentMinutes = now.getMinutes();
    var standupHours = standupTime.split(':')[0];
    var standupMinutes = standupTime.split(':')[1];

    try {
        standupHours = parseInt(standupHours);
        standupMinutes = parseInt(standupMinutes);
    }
    catch (_error) {
        return false;
    }

    if (standupHours == currentHours && standupMinutes == currentMinutes) {
        return true;
    }
    return false;
}

// Returns all standups.
function getStandups() {
    if (fs.existsSync(STANDUP_FILE)) {
        return require(STANDUP_FILE) || [];
    } else {
        fs.writeFile(STANDUP_FILE, "[]", function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("Standup init successful!");
            }
        });
    }
}

// Returns just standups for a given room.
function getStandupsForRoom(room) {
    var allStandups = getStandups();
    var standupsForRoom = [];
    _.each(allStandups, function(standup) {
        if (standup.room == room) {
            standupsForRoom.push(standup);
        }
    });
    return standupsForRoom;
}

// Gets all standups, fires ones that should be.
function checkStandups() {
    var standups = getStandups();

    if (standups.length > 0) {
        _.each(standups, function(standup) {
            if (standupShouldFire(standup.time)) {
                doStandup(standup.room);
            }
        });
    }
}

// Fires the standup message.
function doStandup(room) {
    var message = _.sample(STANDUP_MESSAGES);
    bubo_bot.send_message(room, '@here ' + message);
}

// Stores a standup in the brain.
function saveStandup(room, time) {
    var standups = getStandups();
    var newStandup = {
        time: time,
        room: room
    };
    standups.push(newStandup);
    updateBrain(standups);
}

// Updates the brain's standup knowledge.
function updateBrain(standups) {
    fs.writeFile(STANDUP_FILE, JSON.stringify(standups, null, 4), function(err){
        if (err){
            console.log(err);
        } else {
            var success = "Running config saved!"
            delete require.cache[STANDUP_FILE];
            require(STANDUP_FILE) || [];
            console.log(success);
        }
    });
}

function clearAllStandupsForRoom(room) {
    var standups = getStandups();
    var standupsToKeep = [];
    var standupsRemoved = 0;
    _.each(standups, function(standup) {
        if (standup.room != room) {
            standupsToKeep.push(standup);
        }
        else {
            standupsRemoved++;
        }
    });
    updateBrain(standupsToKeep);
    return standupsRemoved;
}

function clearSpecificStandupForRoom(room, time) {
    var standups = getStandups();
    var standupsToKeep = [];
    var standupsRemoved = 0;
    _.each(standups, function(standup) {
        if (standup.room == room && standup.time == time) {
            standupsRemoved++;
        }
        else {
            standupsToKeep.push(standup);
        }
    });
    updateBrain(standupsToKeep);
    return standupsRemoved;
}

standup.is_match = function(msg) {
    return msg.match(clearAllStandups_re) || msg.match(deleteOneStandup_re) || 
        msg.match(createOneStandup_re) || msg.match(listOneStandup_re) || 
        msg.match(listAllStandup_re) || msg.match(standupHelp_re);
}

standup.respond = function(msg, channel, cb) {
    if (msg.match(clearAllStandups_re)) {
        var standupsCleared = clearAllStandupsForRoom(channel);
        cb(channel,'Deleted ' + standupsCleared + ' standup' + (standupsCleared === 1 ? '' : 's') + '. No more standups for you.');
    } else if (msg.match(deleteOneStandup_re)) {
        var time = msg.match(deleteOneStandup_re)[1]
        var standupsCleared = clearSpecificStandupForRoom(channel, time);
        if (standupsCleared === 0) {
            cb(channel,"Nice try. You don't even have a standup at " + time);
        } else {
            cb(channel,"Deleted your " + time + " standup.");
        }
    } else if (msg.match(createOneStandup_re)) {
        var time = msg.match(createOneStandup_re)[1];

        // NOTE: This works for Hipchat. You may need to change this line to 
        // match your adapter. 'room' must be saved in a format that will
        // work with the standup.messageRoom function.
        var room = channel;

        saveStandup(room, time);
        cb(channel,"Ok, from now on I'll remind this room to do a standup every weekday at " + time);
    } else if (msg.match(listOneStandup_re)) {
        var standups = getStandupsForRoom(channel);

        if (standups.length === 0) {
            cb(channel,"Well this is awkward. You haven't got any standups set (awkward)");
        } else {
            var standupsText = [];
            if (standups.length === 1) {
                standupsText.push("Here's your standup:");
            } else {
                standupsText.push("Here are your standups:");
            }
            _.each(standups, function (standup) {
                standupsText.push(standup.time);
            });
            cb(channel,standupsText.join('\n'));
        }
    } else if (msg.match(listAllStandup_re)){
        var standups = getStandups();
        if (standups.length === 0) {
            cb(channel,"No, because there aren't any.");
        } else {
            var standupsText = [];
            standupsText.push("Here's the standups for every room:");
            _.each(standups, function (standup) {
                standupsText.push('Room: ' + standup.room + ', Time: ' + standup.time);
            });
            cb(channel,standupsText.join('\n'));
        }
    } else if (msg.match(standupHelp_re)) {
        var message = [];
        message.push("I can remind you to do your daily standup!");
        message.push("Use me to create a standup, and then I'll post in this room every weekday at the time you specify. Here's how:");
        message.push("");
        message.push("create standup at hh:mm - I'll remind you to standup in this room at hh:mm every weekday.");
        message.push("list standups - See all standups for this room.");
        message.push("list standups in every room - Be nosey and see when other rooms have their standup.");
        message.push("delete hh:mm standup - If you have a standup at hh:mm, I'll delete it.");
        message.push("delete all standups - Deletes all standups for this room.");
        cb(channel,message.join('\n'));
    }
};
