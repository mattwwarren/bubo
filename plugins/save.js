var runtimeOptions = require('../config')
var save = {
  save_re: new RegExp(runtimeOptions.mentionName + ".*save", "gi")
};

module.exports = function(module_holder) {
    // the key in this dictionary can be whatever you want
    // just make sure it won't override other modules
    module_holder['save'] = save;
};
