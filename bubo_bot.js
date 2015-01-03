var wobot = require('wobot');
var fs = require('fs');
var path_module = require('path');
var bot_modules = {};
var runtimeOptions = require('./config');
var bubo_bot = exports;

function LoadModules(path) {
    fs.readdirSync(path).forEach(function(fname) {
      if (fname.indexOf('.js') > -1) {
        var modname = fname.substr(0, fname.search("\.js$"));
        bot_modules[modname] = require(path+"/"+fname);
      }
    });
}
var DIR = path_module.join(__dirname, 'plugins');
LoadModules(DIR);

var PRIV_DIR = path_module.join(__dirname, 'private_plugins');
LoadModules(PRIV_DIR);

exports.module_holder = bot_modules;

// Start the bot!
var b = new wobot.Bot({
    debug: runtimeOptions.debug,
    jid: runtimeOptions.hipchatUser + "/bot",
    password: runtimeOptions.hipchatPassword
});

// Connect the bot!
b.connect();

b.onConnect(function() {
  var self = this;
  console.log(' -=- > Connect');
  // Join the rooms configured 
  runtimeOptions.hipchatRoomsToJoin.forEach(function(room) {
    console.log(' -=- > Joining default room ' + room);
    self.join(room);
  });
});

// When invited to a room, join the room!
b.onInvite(function(roomJid, fromJid, reason) {
  var self = this;
  console.log(' -=- > Invited to and joining ' + roomJid + ' by ' + fromJid + ': ' + reason);
  runtimeOptions.hipchatRoomsToJoin.push(roomJid.local + '@' + roomJid.domain);
  self.join(roomJid);
});

// When directly mentioned in a room, process the message.
// Current supported functions:
//     - look up ticket info
//     - save config
//     - answer philosophical questions
//     - self-awareness
//     - giphy API search
//     - standup reminders
b.onMessage(function(channel, from, message) {
  var self = this;
  for (var k in bot_modules){
      if (bot_modules.hasOwnProperty(k)) {
          if (bot_modules[k].is_match(message)) {
              bot_modules[k].respond(message, from, channel, self.message.bind(self));
          }
      } else {
          return
      }
  }
});

bubo_bot.send_message = function(channel, message){
  b.message(channel, message);
}
