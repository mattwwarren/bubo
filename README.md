bubo is a HipChat bot that listens for mentions of JIRA or BitBucket tickets by issue key and expands the
reference into something more readable.

This tool was originally created by Keith Fahlgren of Safari Books Online. It was hacked and slashed by
Matt Warren to function with BitBucket. The current version will only connect to JIRA or BitBucket,
not both!

What does it do?

  1. Joins a room (set defaults in `config.js`)
  1. Checks each message for an upper-case JIRA issue key (`ABC-3`) or BitBucket issue key (`repo-5`)
  1. Responds with some contextual details from JIRA (`https://something.atlassian.net/browse/ABC-3: “Support streaming reading” marked as Closed and assigned to Keith Fahlgren`)
  ** OR details from BitBucket (https://bitbucket.org/someone/repo/issue/5: "Something something broken stuff" marked as resolved and assigned to Matt Warren`)

What if I want it in a new room?

  * In a public room, mention it directly with `@jirabot` and wait for it to join
  * In a private room, invite it using the HipChat invite menu and wait for it to join
  * Add it to the defaults in `config.js` if you want
  ** Alternatively, to save the running config, use `@jirabot save` and find a `config.runtime.js` in the runtime directory

What JIRA projects does it know about?
  
  * Every JIRA project that you explicitly mention in `config.js`
  * Every BitBucket project it has access to for the BitBucket host user in `config.js`

What if I don't want it in a room?

  * Too bad? Don't mention issues with uppercase? Boot the user? Complain?

HipChat setup:

  1. Make a new user named `@jirabot`
  1. Write down the XMPP details for `@jirabot` in `config.js`

JIRA setup:

  1. Have a JIRA user
  1. Write down the JIRA user details in `config.js`

BitBucket setup:

  1. Create a BitBucket user
  1. Write down the BitBucket user details in `config.js`

Developer setup:

    mkdir node_modules
    npm install
    cp config.js.example config.js
    $EDITOR config.js

Running the bot:

    node bubo_bot.js  # runs until it dies, needs a manager to stay up forever
 * pm2 could serve this purpose well. How-to to follow.

Typical output:

    $ node bubo_bot.js
    Cannot load StringPrep-0.1.0 bindings. You may need to `npm install node-stringprep'
    -=- > Connect
    -=- > Joining default room 1_hero@conf.hipchat.com
    -=- > Joining default room 1_hero_core@conf.hipchat.com
    -=- > Joining default room 1_hero_dev@conf.hipchat.com
    -=- > Invited to and joining 1_code_review@conf.hipchat.com by 1_8@chat.hipchat.com: hi @jirabot 
    -=- > Looking up JIRA details for How about ABC-1203 with matches: ABC-1203

Heroku:

To run on Heroku, do the normal (?) things but set the environment variables with `config:add` instead of config.js.
