var ansible = exports;
var fs = require('fs');
var Ansible = require('node-ansible');
var runtimeOptions = require('../config');

var ansible_re = new RegExp(runtimeOptions.mentionName + ".*run ansible (ad-hoc|playbook)", "i");

ansible.is_match = function(message) {
    return message.match(ansible_re);
};

ansible.respond = function(message, channel, cb){
    var ansible_matches = message.match(ansible_re);
    var ansible_func = ansible_matches[1];
    var command;
    if (ansible_func == "ad-hoc") {
        var adhoc_re = /.*run ansible ad-hoc (\w+) on ([\w+\.*]+) ?(with .*)?/i;
        var adhoc_matches = message.match(adhoc_re);
        var module = adhoc_matches[1];
        var host = adhoc_matches[2];
        var args;
        if (adhoc_matches[3]) {
            var args = adhoc_matches[3].match(/(with) (.*)/)[2];
        }
        if (args) {
            command = new Ansible.AdHoc().hosts(host).module(module).args(JSON.parse(args));
        } else {
            command = new Ansible.AdHoc().hosts(host).module(module);
        }
    } else {
        var playbook_re = /.*run ansible playbook (\w+) on ([\w+\.*]+)/i;
        var playbook_matches = message.match(playbook_re);
        var playbook = playbook_matches[1] + ".yml";
        var host = playbook_matches[2];
        //command = new Ansible.Playbook().playbook(playbook).limit(host);
        var not_implemented = "This is not implemented yet. Playbooks cannot be limited yet.";
        cb(channel, not_implemented);
        return false;
    }
    command.inventory(runtimeOptions.ansibleDir + '/inventory');
    var promise = command.exec({cwd:runtimeOptions.ansibleDir});
    promise.then(function(result) {
        if (result.code != 0) {
            var failure = ("FAILURE: " + result.output);
            cb(channel, failure);
        } else {
            var success = ("SUCCESS: " + result.output);
            cb(channel, success);
        }
    });
};
