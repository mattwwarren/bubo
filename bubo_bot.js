try {
  var config = require('./config');
  console.log(' -=- > Loading configuration from config.js');
}
catch (e) {
  console.log(' -=- > Loading configuration from environment variables');
}
var https = require('https');
var wobot = require('wobot');

// Pull this in now to allow either file-based config (checked second) or environment variables (checked first)
var debug = process.env.NODE_DEBUG || config.debug || false;
var runtimeOptions = {
  hipchatUser: process.env.HIPCHAT_USER || config.hipchatUser,
  hipchatPassword: process.env.HIPCHAT_PASSWORD || config.hipchatPassword,
  tracker: process.env.TRACKER || config.tracker
}
if (runtimeOptions.tracker == 'bitbucket'){
    runtimeOptions.bitBucketUrl = process.env.BITBUCKET_URL || config.bitBucketUrl;
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


var b = new wobot.Bot({
    debug: debug,
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
  var alreadyProcessed = [];
  var matches = message.match(runtimeOptions.bbProjectRe);
  if (!matches) {
    return;
  }

  console.log(' -=- > Looking up JIRA details for ' + message + ' with matches: ' + matches);
  matches.forEach(function(issueKey) { 
    if (alreadyProcessed.indexOf(issueKey) < 0) {
      alreadyProcessed.push(issueKey);
      repository = issueKey.replace("-\d*", "");
      issueNum = issueKey.replace("main-", "");

      var options = {
        auth: runtimeOptions.bbUsername + ':' + runtimeOptions.bbPassword,
        headers: { 'accept': 'application/json' },
        hostname: "bitbucket.org",
        method: 'GET',
        path: '/api/1.0/repositories/wanderu/' + repository + '/issues/' + issueNum,
        port: 443
      };


      console.log(options);
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
});
