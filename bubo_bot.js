try {
  var config = require('./config');
  console.log(' -=- > Loading configuration from config.js');
}
catch (e) {
  console.log(' -=- > Loading configuration from environment variables');
}
var https = require('https');
var jira = require('jira-api');
var wobot = require('wobot');


// Pull this in now to allow either file-based config (checked second) or environment variables (checked first)
var runtimeOptions = {
  hipchatUser: process.env.HIPCHAT_USER || config.hipchatUser,
  hipchatPassword: process.env.HIPCHAT_PASSWORD || config.hipchatPassword,
  jiraBrowseUrl: process.env.JIRA_BROWSE_URL || config.jiraBrowseUrl,
  jiraHostname: process.env.JIRA_HOSTNAME || config.jiraHostname,
  jiraUsername: process.env.JIRA_USERNAME || config.jiraUsername,
  jiraPassword: process.env.JIRA_PASSWORD || config.jiraPassword
};
runtimeOptions.hipchatRoomsToJoin = process.env.HIPCHAT_ROOMS_TO_JOIN ? process.env.HIPCHAT_ROOMS_TO_JOIN.split(',') : config.hipchatRoomsToJoin;
runtimeOptions.jiraProjectRe = process.env.JIRA_PROJECT_RE ? new RegExp(process.env.JIRA_PROJECT_RE, "g") : config.jiraProjectRe;


var b = new wobot.Bot({
  jid: runtimeOptions.hipchatUser + "/bot",
  password: runtimeOptions.hipchatPassword
});

b.connect();

b.onConnect(function() {
  var self = this;
  console.log(' -=- > Connect');
  runtimeOptions.hipchatRoomsToJoin.forEach(function(room) {
    console.log(' -=- > Joining default room ' + room);
    self.join(room);
  });
});

b.onInvite(function(roomJid, fromJid, reason) {
  var self = this;
  console.log(' -=- > Invited to and joining ' + roomJid + ' by ' + fromJid + ': ' + reason);
  self.join(roomJid);
});

b.onMessage(function(channel, from, message) {
  var self = this;
  var matches = message.match(runtimeOptions.jiraProjectRe);
  if (!matches) {
    return;
  }

  console.log(' -=- > Looking up JIRA details for ' + message + ' with matches: ' + matches);
  matches.forEach(function(jiraKey) { 
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
  });
});
