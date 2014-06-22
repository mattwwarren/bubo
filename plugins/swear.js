var swear = exports;

swear.is_match = function(message){
    var runtimeOptions = require('../config');
    var swear_re = new RegExp(runtimeOptions.mentionName + ".*(ass(hole)?|bastard|bitch|fuck|shit)+(\W|$)", "gim");
    return message.match(swear_re);
};

swear.respond = function(message){
    var woah_now = "I'm sorry, I don't respond well to cursing.";
    return woah_now;
};
