var swear = exports;

swear.is_match = function(message){
    var runtimeOptions = require('../config');
    var swear_re = new RegExp(runtimeOptions.mentionName + " (ass(hole)?|bastard|bitch|fuck|shit)+", "gim");
    return message.match(swear_re);
};

swear.respond = function(message, from, channel, cb){
    var woah_now = "I'm sorry, I don't respond well to cursing.";
    cb(channel, woah_now);
};
