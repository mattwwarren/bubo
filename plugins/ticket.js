var ticket = exports;
var https = require('https');
var runtimeOptions = require('../config');
var alreadyProcessed = [];

var ticket_re = new RegExp(runtimeOptions.bbProjectRe, "gi");

ticket.is_match = function(message){
    return message.match(ticket_re);
}
    
ticket.respond = function(message, callback){    
    var ticket_matches = message.match(ticket_re);
    ticket_matches.forEach(function(issueKey) {
      if (runtimeOptions.tracker == "bitbucket") {
      console.log(' -=- > Looking up BitBucket details for ' + message + ' with matches: ' + ticket_matches);
        if (alreadyProcessed.indexOf(issueKey) < 0) {
          console.log(issueKey);
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
                console.log(clarification);
                return clarification;
              }
              catch (e) {
                var sorry = '/me could not find ' + issueKey;
                console.error(e);
                return sorry;
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
                return clarification;
              }
              catch (e) {
                var sorry = '/me could not find ' + jiraKey;
                console.error(e);
                return sorry;
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
}
