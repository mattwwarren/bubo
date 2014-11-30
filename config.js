var fs = require('fs');

this.configData = {};
try {
  this.configData = require('./config.json');
  console.log(' -=- > Loading configuration from config.json');
}
catch (e) {
  console.log(' -=- > Loading configuration from environment variables');
}

// Pull this in now to allow either file-based config (checked second) or environment variables (checked first)
var runtimeOptions = {
  mentionName: process.env.MENTION_NAME || this.configData.mentionName,
  hipchatUser: process.env.HIPCHAT_USER || this.configData.hipchatUser,
  hipchatPassword: process.env.HIPCHAT_PASSWORD || this.configData.hipchatPassword,
  hipchatApi: process.env.HIPCHAT_API || this.configData.hipchatApi,
  tracker: process.env.TRACKER || this.configData.tracker,
  modules: process.env.MODULES || this.configData.modules,
  debug: process.env.NODE_DEBUG || this.configData.debug || false,
  giphyKey: process.env.GIPHY_KEY || this.configData.giphyKey,
  baseDir: process.env.BASE_DIR || this.configData.baseDir,
  ansibleDir: process.env.ANSIBLE_DIR || this.configData.ansibleDir
};

// Are we connecting to BitBucket? Otherwise, assume JIRA.
if (runtimeOptions.tracker == 'bitbucket'){
    runtimeOptions.bitBucketUrl = process.env.BITBUCKET_URL || this.configData.bitBucketUrl;
    runtimeOptions.bbOwner = process.env.BB_OWNER || this.configData.bbOwner;
    runtimeOptions.bbUsername = process.env.BB_USERNAME || this.configData.bbUsername;
    runtimeOptions.bbPassword = process.env.BB_PASSWORD || this.configData.bbPassword;
    runtimeOptions.bbProjectRe = process.env.BB_PROJECT_RE || this.configData.bbProjectRe;
    runtimeOptions.bbProjectPullRe = process.env.BB_PROJECT_PULL_RE || this.configData.bbProjectPullRe;
} else {
    runtimeOptions.jiraBrowseUrl = process.env.JIRA_BROWSE_URL || this.configData.jiraBrowseUrl;
    runtimeOptions.jiraHostname = process.env.JIRA_HOSTNAME || this.configData.jiraHostname;
    runtimeOptions.jiraUsername = process.env.JIRA_USERNAME || this.configData.jiraUsername;
    runtimeOptions.jiraPassword = process.env.JIRA_PASSWORD || this.configData.jiraPassword;
    runtimeOptions.jiraProjectRe = new RegExp(process.env.JIRA_PROJECT_RE, "gi") || new RegExp(this.configData.jiraProjectRe, "gi");
};
runtimeOptions.hipchatRoomsToJoin = new Array();
runtimeOptions.hipchatRoomsToJoin = process.env.HIPCHAT_ROOMS_TO_JOIN ? process.env.HIPCHAT_ROOMS_TO_JOIN.split(',') : this.configData.hipchatRoomsToJoin;

module.exports = runtimeOptions;
