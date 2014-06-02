var swear_re = new RegExp(runtimeOptions.mentionName + ".*(ass(hole)?|bastard|bitch|fuck|shit)+(\W|$)", "gim")
var swear_matches = message.match(swear_re);

module.exports = swear;
