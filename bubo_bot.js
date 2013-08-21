var config = require('./config');
var https = require('https');
var jira = require('jira-api');
var wobot = require('wobot');


var b = new wobot.Bot({
  jid: config.hipchatUser + "/bot",
  password: config.hipchatPassword
});

b.connect();

b.onConnect(function() {
  var self = this;
  console.log(' -=- > Connect');
  config.hipchatRoomsToJoin.forEach(function(room) {
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
  var matches = message.match(config.jiraProjectRe);
  if (!matches) {
    return;
  }

  console.log(' -=- > Looking up JIRA details for ' + message + ' with matches: ' + matches);
  matches.forEach(function(jiraKey) { 
    var options = {
      auth: config.jiraUsername + ':' + config.jiraPassword,
      headers: { 'accept': 'application/json' },
      hostname: config.jiraHostname,
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
          var clarification = config.jiraBrowseUrl + jiraData.key + ': “' + jiraData.fields.summary + '” marked as ' + jiraData.fields.status.name + ' and assigned to ' + jiraData.fields.assignee.displayName;
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
