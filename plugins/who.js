var who = exports;
var runtimeOptions = require('../config');

who.is_match = function(message){
  var who_re = new RegExp(runtimeOptions.mentionName + ".*(who are you|what are you|do you do)+", "gi");
  return message.match(who_re);
}

who.respond = function(message, from, channel, cb){
    var what_am_i = "I'm just a simple node js script running via pm2 in the cloud!";
    cb(channel, what_am_i);
}
