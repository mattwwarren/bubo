var runtimeOptions = require('../config')
var swear = {
  swear_re: new RegExp(runtimeOptions.mentionName + ".*(ass(hole)?|bastard|bitch|fuck|shit)+(\W|$)", "gim"),
};

module.exports = function(module_holder) {
    // the key in this dictionary can be whatever you want
    // just make sure it won't override other modules
    module_holder['swear'] = swear;
};