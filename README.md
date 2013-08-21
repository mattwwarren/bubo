bubo is a HipChat bot that listens for mentions of JIRA tickets by issue key and expands the
reference into something more readable.


What does it do?

  1. Joins a room (set defaults in `config.js`)
  1. Checks each message for an upper-case JIRA issue key (`ABC-3`)
  1. Responds with some contextual details from JIRA (`https://something.atlassian.net/browse/ABC-3: “Support streaming reading” marked as Closed and assigned to Keith Fahlgren`)

What if I want it in a new room?

  * In a public room, mention it directly with `@jirabot` and wait for it to join
  * In a private room, invite it using the HipChat invite menu and wait for it to join
  * Add it to the defaults in `config.js` if you want


What JIRA projects does it know about?
  
  * Every JIRA project that you explicitly mention in `config.js`

What if I don't want it in a room?

  * Too bad? Don't mention issues with uppercase? Boot the user? Complain?

HipChat setup:

  1. Make a new user named `@jirabot`
  1. Write down the XMPP details for `@jirabot` in `config.js`

JIRA setup:

  1. Have a JIRA user
  1. Write down the JIRA user details in `config.js`

Developer setup:

    mkdir node_modules
    npm install
    cp config.js.example config.js
    $EDITOR config.js

Running the bot:

    node bubo_bot.js  # runs until it dies, needs a manager to stay up forever

Typical output:

    $ node bubo_bot.js
    Cannot load StringPrep-0.1.0 bindings. You may need to `npm install node-stringprep'
    -=- > Connect
    -=- > Joining default room 1_hero@conf.hipchat.com
    -=- > Joining default room 1_hero_core@conf.hipchat.com
    -=- > Joining default room 1_hero_dev@conf.hipchat.com
    -=- > Invited to and joining 1_code_review@conf.hipchat.com by 1_8@chat.hipchat.com: hi @jirabot 
    -=- > Looking up JIRA details for How about ABC-1203 with matches: ABC-1203

