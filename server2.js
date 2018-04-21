var scores = [];

function Score(id,score){
  this.id = id;
  this.score = score;
}


var express = require('express');
// Create the app
var app = express();

app.use(express.static('public'));

var server = app.listen(process.env.PORT || 3030, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

// WebSockets work with the HTTP server
var io = require('socket.io')(server);

//for user registration
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

setInterval(heartbeat, 35);

function heartbeat() {
  data = {
          scores:scores
        }
  io.sockets.emit('server2_heartbeat', data);
}


io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {
  	console.log("Server-client: " + socket.id);

    socket.on('new_client',
      function(data) {
        console.log("Server 1(" + socket.id + ") has new client: " + data.id);

        var sc = new Score(data.id, 0);
        scores.push(sc);
      }
    );

    socket.on("update_score",
      function(data) {
        var sc;
        for (var i = 0; i < scores.length; i++) {
          if (data.id == scores[i].id) {
            sc = scores[i];
            break;
          }
        }

        sc.score = data.score;
       
      }
    );

    socket.on("delete_score",
      function(data) {
       scores = scores.filter(function( obj ) {
          return obj.id !== data.id;
      });
      }
    );

  }
);
