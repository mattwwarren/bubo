Bubo
==================

bubo is a HipChat bot that listens for mentions of JIRA or BitBucket tickets by issue key and expands the
reference into something more readable.

This tool was originally created by Keith Fahlgren of Safari Books Online. It was hacked and slashed by
Matt Warren to function with BitBucket. The current version will only connect to JIRA or BitBucket,
not both!

Project Details
------------------

### What does it do?

  1. Joins a room (set defaults in `config.json`)
  1. Checks each message for an upper-case JIRA issue key (`ABC-3`) or BitBucket issue key (`repo-5`)
  1. Responds with some contextual details from JIRA (https://something.atlassian.net/browse/ABC-3: "Support streaming reading" marked as Closed and assigned to Keith Fahlgren)
    * OR details from BitBucket (https://bitbucket.org/someone/repo/issue/5: "Something something broken stuff" marked as resolved and assigned to Matt Warren`)

###What if I want it in a new room?

  * In a public room, mention it directly with `@jirabot` and wait for it to join
  * In a private room, invite it using the HipChat invite menu and wait for it to join
  * Add it to the defaults in `config.json` if you want
    * Alternatively, to save the running config, use `@jirabot save` and find a `config.runtime.json` in the runtime directory
    * You will need to copy the .runtime. config to the real deal. Overwriting configs automagically is scary.

###What projects does it know about?
  
  * Every JIRA project that you explicitly mention in `config.json`
  * Every BitBucket project it has access to for the BitBucket host user in `config.json`

###What if I don't want it in a room?

  * Too bad? Boot the user? Complain?

Setup
---------

### HipChat setup:
  1. Make a new user named `@jirabot`
  1. Write down the XMPP details for `@jirabot` in `config.json`

### JIRA setup:

  1. Have a JIRA user
  1. Write down the JIRA user details in `config.json`

### BitBucket setup:

  1. Create a BitBucket user
  1. Write down the BitBucket user details in `config.json`

### Developer setup:

    mkdir node_modules
    npm install
    cp config.json.example config.json
    $EDITOR config.json

### Editing the config:

  1. Make sure to remove the big comment block at the top
  1. Everything else should be documented in the config example 

### Running the bot:

#### Developer mode: 
    npm install -g nodemon
    nodemon bubo_bot.js  # runs and restarts if files change

#### Server-side:
    npm install -g pm2
    pm2 start bubo_bot.js -i 1 --name "bubo" # runs and restarts if the process dies

### Typical output:

    $ nodemon bubo_bot.js
    2 Jun 02:32:18 - [nodemon] v1.1.1
    2 Jun 02:32:18 - [nodemon] to restart at any time, enter `rs`
    2 Jun 02:32:18 - [nodemon] watching: *.*
    2 Jun 02:32:18 - [nodemon] starting `node bubo_bot.js`
    Cannot load StringPrep-0.2.3 bindings (using fallback). You may need to `npm install node-stringprep`
    -=- > Connect
    -=- > Joining default room 1_hero@conf.hipchat.com
    -=- > Joining default room 1_hero_core@conf.hipchat.com
    -=- > Joining default room 1_hero_dev@conf.hipchat.com
    -=- > Invited to and joining 1_code_review@conf.hipchat.com by 1_8@chat.hipchat.com: hi @jirabot 
    -=- > Looking up JIRA details for How about ABC-1203 with matches: ABC-1203

### Heroku:

To run on Heroku, do the normal (?) things but set the environment variables with `config:add` instead of config.json.

Extending the bot
------------------

Let's face it, nothing is perfect so if you need bubo to do something new, you can!

### Adding plugins:

Drop a new js file in the plugins dir.

Your file MUST implement the following two methods:
1. `is_match` which takes the message received by the bot and returns a boolean
1. `respond` which takes the message received by the bot and returns a string

bubo is smart enough to find and load your js automatically.

### Gotcha

If you use vim or another editor that creates a temporary file with .js in the name, you may find nodemon fails to restart the bot because of that file. The easiest way to deal with this right now is close your editor. Sorry.
