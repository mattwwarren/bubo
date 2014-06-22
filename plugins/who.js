var who = exports;

who.is_match = function(message){
  var who_re = new RegExp(runtimeOptions.mentionName + ".*(who are you|what are you|do you do)+", "gi");
  return message.match(who_re);
}

who.respond = function(message){
    var what_am_i = "I'm just a simple node js script running via pm2 in the cloud!";
    return what_am_i;
}
