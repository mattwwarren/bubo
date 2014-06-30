var appearance = exports;
var runtimeOptions = require('../config');

appearance.is_match = function(message){
    var appearance_re = new RegExp(runtimeOptions.mentionName + ".*(what do you look like|see your portrait|see a picture of you)+", "gi");
    return message.match(appearance_re);
}

appearance.respond = function(message, channel, cb){
    var nic_cage = "http://static2.businessinsider.com/image/509802cb69bedd6209000009/nicolas-cage-will-be-in-the-expendables-3.jpg";
    cb(channel, nic_cage);
}
