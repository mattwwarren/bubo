var philosophy = exports;

philosophy.is_match = function(message){
    var philosophy_matches = message.match(/(meaning of life|answer to life|life(, the)? universe[,| and|, and]? everything|answer to (the )? ultimate question)/g);
    return philosophy_matches; 
};

philosophy.respond = function(message){
      var the_answer = "42";
      return the_answer;
};
