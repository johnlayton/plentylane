var http = require("http");
var fs = require("fs");
var util = require("util");
var sys = require('sys');

http.createServer(function (req, res) {
  var index = "./plentylane.html";
  var fileName;
  var interval;

  if (req.url === "/")
    fileName = index;
  else
    fileName = "." + req.url;

  if (fileName === "./stream") {
    res.writeHead(200, {
      "Content-Type"  : "text/event-stream", 
      "Cache-Control" : "no-cache", 
      "Connection"    : "keep-alive"
    });
    res.write("retry: 10000\n");

    var filename = __dirname + "/plentylane.txt"

    fs.exists(filename, function (exists) {
      util.debug(exists ? "it's there" : "no passwd!");
    });
    
    fs.watchFile(filename, function ( next, last ) { 
      rs = fs.createReadStream(filename, {start: last.size, end: next.size, encoding: 'utf-8'})
      rs.on( "data", function( data ) {
        var messages = data.split( '\n' );
        for ( var i = 0; i < messages.length; i++ ) {
          res.write( "data: " + JSON.stringify( { time : new Date(), message : messages[i] } )  + "\n\n" );
        }
      });
    });
  } else if (fileName === index) {
    fs.exists(fileName, function(exists) {
      if (exists) {
        fs.readFile(fileName, function(error, content) {
          if (error) {
            res.writeHead(500);
            res.end();
          } else {
            res.writeHead(200, {"Content-Type":"text/html"});
            res.end(content, "utf-8");
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }

}).listen(10000, "127.0.0.1");

console.log("plantylane running at http://127.0.0.1:10000/");

