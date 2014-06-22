var save = exports;
var fs = require('fs');
var runtimeOptions = require('../config');

save.is_match = function(message) {
    var save_re = new RegExp(runtimeOptions.mentionName + ".*save", "gi");
    return message.match(save_re);
};

save.respond = function(message){
    fs.writeFile("config.runtime.json", JSON.stringify(runtimeOptions, null, 4), function(err){
        if (err){
            console.log(err);
            return err;
        } else {
            var success = "Running config saved!"
            console.log(success);
            return success;
        }
    });
};
