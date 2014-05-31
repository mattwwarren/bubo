try {
  var config = require('./config');
  console.log(' -=- > Loading configuration from config.js');
}
catch (e) {
  console.log(' -=- > Loading configuration from environment variables');
}
var https = require('https');
var wobot = require('wobot');
var fs = require('fs');

// Pull this in now to allow either file-based config (checked second) or environment variables (checked first)
// Should we run XMPP with debug?
var debug = process.env.NODE_DEBUG || config.debug || false;

// Grab common config options
var runtimeOptions = {
  mentionName: process.env.MENTION_NAME || config.mentionName,
  hipchatUser: process.env.HIPCHAT_USER || config.hipchatUser,
  hipchatPassword: process.env.HIPCHAT_PASSWORD || config.hipchatPassword,
  tracker: process.env.TRACKER || config.tracker
};

// Are we connecting to BitBucket? Otherwise, assume JIRA.
if (runtimeOptions.tracker == 'bitbucket'){
    runtimeOptions.bitBucketUrl = process.env.BITBUCKET_URL || config.bitBucketUrl;
    runtimeOptions.bbOwner = process.env.BB_OWNER || config.bbOwner;
    runtimeOptions.bbUsername = process.env.BB_USERNAME || config.bbUsername;
    runtimeOptions.bbPassword = process.env.BB_PASSWORD || config.bbPassword;
    runtimeOptions.bbProjectRe = process.env.BB_PROJECT_RE ? new RegExp(process.env.BB_PROJECT_RE, "g") : config.bbProjectRe;
} else {
    runtimeOptions.jiraBrowseUrl = process.env.JIRA_BROWSE_URL || config.jiraBrowseUrl;
    runtimeOptions.jiraHostname = process.env.JIRA_HOSTNAME || config.jiraHostname;
    runtimeOptions.jiraUsername = process.env.JIRA_USERNAME || config.jiraUsername;
    runtimeOptions.jiraPassword = process.env.JIRA_PASSWORD || config.jiraPassword;
    runtimeOptions.jiraProjectRe = process.env.JIRA_PROJECT_RE ? new RegExp(process.env.JIRA_PROJECT_RE, "g") : config.jiraProjectRe;
};
runtimeOptions.hipchatRoomsToJoin = process.env.HIPCHAT_ROOMS_TO_JOIN ? process.env.HIPCHAT_ROOMS_TO_JOIN.split(',') : config.hipchatRoomsToJoin;

// Start the bot!
var b = new wobot.Bot({
    debug: debug,
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
  runtimeOptions.hipchatRoomsToJoin.append(roomJid);
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
  var ticket_matches = message.match(runtimeOptions.bbProjectRe);
  var save_re = new RegExp(runtimeOptions.mentionName + ".*save", "gi");
  var save_matches = message.match(save_re);
  var philosophy_matches = message.match(/(meaning of life|answer to life|life(, the)? universe[,| and|, and]? everything|answer to (the )? ultimate question)/g);
  var who_re = new RegExp(runtimeOptions.mentionName + ".*(who are you|what are you|do you do)+", "gi");
  var who_matches = message.match(who_re);
  var make_re = new RegExp(runtimeOptions.mentionName + ".*make me", "gi");
  var make_matches = message.match(make_re);
  var swear_re = new RegExp(runtimeOptions.mentionName + ".*(ass(hole)?|bastard|bitch|fuck|shit)+(\W|$)", "gim")
  var swear_matches = message.match(swear_re);
  if (swear_matches) {
      var woah_now = "I'm sorry, I don't respond well to cursing.";
      self.message(channel, woah_now);
  } else if (ticket_matches) {
      console.log(' -=- > Looking up JIRA details for ' + message + ' with matches: ' + ticket_matches);
      ticket_matches.forEach(function(issueKey) {
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
    });
  } else if (save_matches) {
      fs.writeFile("config.runtime.js", "var config = " + JSON.stringify(runtimeOptions, null, 4) + ";\n\nmodule.exports = config;", function(err){
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
