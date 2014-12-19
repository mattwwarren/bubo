var pullrequest = exports;
var runtimeOptions = require('../config');
var https = require('https');

var pullreq_re = new RegExp(runtimeOptions.bbProjectPullRe, "gi");
var alreadyProcessed = [];

pullrequest.is_match = function(message){
    return message.match(pullreq_re);
};

pullrequest.respond = function(message, from, channel, cb){
    var pr_matches = message.match(pullreq_re);
    // BitBucket repos can be parsed from the message
    var repository = pr_matches[0].match(/\w+/)[0];
    console.log(pr_matches);
    // Once we have the repo, get the pr id #
    pr_matches.forEach(function(match) {
      prNum = match.match(/\d+/);
      if (runtimeOptions.tracker == "bitbucket") {
        console.log(' -=- > Looking up BitBucket details for ' + message + ' with matches: ' + pr_matches);
        if (alreadyProcessed.indexOf(prNum) < 0) {
          alreadyProcessed.push(prNum);

          var options = {
              auth: runtimeOptions.bbUsername + ':' + runtimeOptions.bbPassword,
              headers: { 'accept': 'application/json' },
              hostname: "bitbucket.org",
              method: 'GET',
              path: '/api/2.0/repositories/' + runtimeOptions.bbOwner + '/' + repository + '/pullrequests/' + prNum,
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
                var clarification = runtimeOptions.bitBucketUrl + repository + "/pull-request/" + bbData.id + ': "' + bbData.title + '" marked as ' + bbData.state + ' and was created by ' + bbData.author.display_name;
                cb(channel, clarification);
              }
              catch (e) {
                var sorry = '/me could not find ' + prKey;
                console.error(e);
                cb(channel, sorry);
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
};
