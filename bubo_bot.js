var https = require('https');
var wobot = require('wobot');
var fs = require('fs');
var path_module = require('path');
var module_holder = {};
var runtimeOptions = require('./config');

function LoadModules(path) {
    fs.readdirSync(path).forEach(function(fname) {
        var modname = fname.substr(0, fname.search(".js"));
        bot_modules[modname] = require(path+"/"+fname);
    });
}
var DIR = path_module.join(__dirname, 'plugins');
LoadModules(DIR);

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
//     - answer philosophical questions??
b.onMessage(function(channel, from, message) {
  var self = this;
  var alreadyProcessed = [];
  var ticket_re = new RegExp(runtimeOptions.bbProjectRe, "gi");
  var ticket_matches = message.match(ticket_re);
  var swear_matches = message.match(module_holder['swear'].swear_re);
  var save_matches = message.match(module_holder['save'].save_re);
  var philosophy_matches = message.match(/(meaning of life|answer to life|life(, the)? universe[,| and|, and]? everything|answer to (the )? ultimate question)/g);
  var who_re = new RegExp(runtimeOptions.mentionName + ".*(who are you|what are you|do you do)+", "gi");
  var who_matches = message.match(who_re);
  var make_re = new RegExp(runtimeOptions.mentionName + ".*make me", "gi");
  var make_matches = message.match(make_re);
  if (swear_matches) {
      var woah_now = "I'm sorry, I don't respond well to cursing.";
      self.message(channel, woah_now);
  } else if (ticket_matches) {
    ticket_matches.forEach(function(issueKey) {
      if (runtimeOptions.tracker == "bitbucket") {
      console.log(' -=- > Looking up BitBucket details for ' + message + ' with matches: ' + ticket_matches);
        if (alreadyProcessed.indexOf(issueKey) < 0) {
          alreadyProcessed.push(issueKey);
          // For bitbucket, we need to parse the repo from the message
          repository = issueKey.replace(/-\d*/g, "");
          // Once we have the repo, get the issue id #
          issueNum = issueKey.replace(repository + "-", "");

          var options = {
              auth: runtimeOptions.bbUsername + ':' + runtimeOptions.bbPassword,
              headers: { 'accept': 'application/json' },
              hostname: "bitbucket.org",
              method: 'GET',
              path: '/api/1.0/repositories/' + runtimeOptions.bbOwner + '/' + repository + '/issues/' + issueNum,
              port: 443
          };

          var body = '';
          var req = https.request(options, function(res) {

            res.on('data', function(chunk) {
              body += chunk;
            });

            res.on('end', function() {
              try {
                var bbData = JSON.parse(body);
                var clarification = runtimeOptions.bitBucketUrl + repository + "/issue/" + bbData.local_id + ': "' + bbData.title + '" marked as ' + bbData.status + ' and assigned to ' + bbData.responsible.display_name;
                self.message(channel, clarification);
              }
              catch (e) {
                var sorry = '/me could not find ' + issueKey;
                console.error(e);
                self.message(channel, sorry);
              }
            });
          });
          req.end();

          req.on('error', function(e) {
            console.error(e);
          });
        }
      } else {
        // Do JIRA stuff here.
        console.log(' -=- > Looking up JIRA details for ' + message + ' with matches: ' + ticket_matches); 
        if (alreadyProcessed.indexOf(jiraKey) < 0) {
          alreadyProcessed.push(jiraKey);
          var options = {
            auth: runtimeOptions.jiraUsername + ':' + runtimeOptions.jiraPassword,
            headers: { 'accept': 'application/json' },
            hostname: runtimeOptions.jiraHostname,
            method: 'GET',
            path: '/rest/api/2/issue/' + jiraKey,
            port: 443
          };

          var body = '';
          var req = https.request(options, function(res) {

            res.on('data', function(chunk) {
              body += chunk;
            });

            res.on('end', function() {
              try {
                var jiraData = JSON.parse(body);
                var clarification = runtimeOptions.jiraBrowseUrl + jiraData.key + ': “' + jiraData.fields.summary + '” marked as ' + jiraData.fields.status.name + ' and assigned to ' + jiraData.fields.assignee.displayName;
                self.message(channel, clarification);
              }
              catch (e) {
                var sorry = '/me could not find ' + jiraKey;
                console.error(e);
                self.message(channel, sorry);
              }
            });
          });
          req.end();

          req.on('error', function(e) {
            console.error(e);
          });
        }
      }
    });
  } else if (save_matches) {
      fs.writeFile("config.runtime.json", JSON.stringify(runtimeOptions, null, 4), function(err){
          if (err){
              console.log(err);
              self.message(channel, err);
          } else {
              var success = "Running config saved!"
              console.log(success);
              self.message(channel, success);
          }
      });
  } else if (philosophy_matches) {
      var the_answer = "42";
      self.message(channel, the_answer);
  } else if (who_matches) {
      var what_am_i = "I'm just a simple node js script running via pm2 in the cloud!";
      self.message(channel, what_am_i);
  } else if (make_matches) {
      var sandwich = message.replace(/.*make me (a(n)? )?/g, "");
      var doit_yourself = "Why don't you make your own " + sandwich + "?";
      var onit = "Okay, I'll get right on making your " + sandwich + "!";
      var rando = Math.floor((Math.random() * 10) + 1);
      if (rando % 2 == 0) {
          self.message(channel, onit);
      } else {
          self.message(channel, doit_yourself);
      }
  } else {
      return
  }
});
