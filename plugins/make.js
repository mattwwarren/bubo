var make = exports;
var runtimeOptions = require('../config');

make.is_match = function(message){
    var make_re = new RegExp(runtimeOptions.mentionName + ".*make me", "gi");
    return message.match(make_re);
}

make.respond = function(message, from, channel, cb){
    var sandwich = message.replace(/.*make me (a(n)? )?/g, "");
    var doit_yourself = "Why don't you make your own " + sandwich + "?";
    var onit = "Okay, I'll get right on making your " + sandwich + "!";
    var rando = Math.floor((Math.random() * 10) + 1);
    if (rando % 2 == 0) {
        cb(channel, onit);
    } else {
        cb(channel, doit_yourself);
    }
}
