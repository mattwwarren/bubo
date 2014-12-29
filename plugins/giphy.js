var giphy = exports;
var runtimeOptions = require('../config');
var http = require('http');

giphy.is_match = function(message){
  var giphy_re = new RegExp("\/giphy (.*)", "i");
  return message.match(giphy_re);
}

giphy.respond = function(message, from, channel, cb){
  var giphy_q = message.split(/\/giphy /)[1].replace(/ /g,"+");
  var img_obj = '';
  var api_key = runtimeOptions.giphyKey;
  var api_host = 'api.giphy.com';
  var endpoint = '/v1/gifs/search';
  var options = {
    hostname: api_host,
    path: endpoint + '?api_key=' + api_key + '&q=' + giphy_q + '&rating=pg-13'
  };

  var body = '';
  
  //another chunk of data has been recieved, so append it to `str`
  var req = http.request(options, function(res) {

    res.on('data', function (chunk) {
      body += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    res.on('end', function () {
      var full_res = JSON.parse(body);
      data = full_res.data || [];
      if (data.length) {
        img_obj = data[Math.floor(Math.random() * data.length)];
        giphy_gif = (img_obj.images.original.url);
        cb(channel, "This gif is powered by Giphy: " + giphy_gif);
      } else {
        cb(channel, "No results found for " + giphy_q);
      };
    });
  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });

};

