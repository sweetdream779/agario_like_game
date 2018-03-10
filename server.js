var blobs = [];
var scores = [];
var miniblobs=[];
var width = 1000;
var height = 800;
var nMiniblobs = 50;

var scal = 2;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function MiniBlob(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
}
function createMiniBlobs(n){
  var miniblob=[];
  for (var i = 0; i < n; i++) {
    var x = getRandomInt(-width/scal,width/scal);
    var y = getRandomInt(-height/scal,height/scal);
    miniblob[i] = new MiniBlob(x, y, 3);
  }
  console.log('Miniblobs created ' + miniblob.length);
  return miniblob;
}
function repairMiniBlobs(miniblob, n_cur, n_total){
  for(var i = n_cur; i<n_total; i++){
    var x = getRandomInt(-width/scal,width/scal);
    var y = getRandomInt(-height/scal,height/scal);
    miniblob[i] = new MiniBlob(x, y, 3);
  }
  return miniblob;
}


function Blob(id, x, y, r) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.r = r;
}

function Score(id,score){
  this.id = id;
  this.score = score;
}

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
  //miniblobs = createMiniBlobs(10);
}

app.use(express.static('public'));


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 40);

function heartbeat() {
  //io.sockets.emit('heartbeat', blobs);
  data = {
          miniblobs:miniblobs,
          blobs:blobs,
          scores:scores
        }
  io.sockets.emit('heartbeat', data);
}



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);

    socket.on('start',
      function(data) {
        if(blobs.length<1){
          miniblobs = createMiniBlobs(nMiniblobs);
        }
        var sc = new Score(socket.id, 0);
        scores.push(sc);
        console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
        var blob = new Blob(socket.id, data.x, data.y, data.r);
        blobs.push(blob);
      }
    );


    socket.on('update',
      function(data) {
        //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
        var blob;
        var sc;
        miniblobs = data.miniblobs;
        //console.log("Recieved " + miniblobs.length + " miniblobs from "+socket.id);
        for (var i = 0; i < blobs.length; i++) {
          if (socket.id == blobs[i].id) {
            blob = blobs[i];
            break;
          }
        }

        for (var i = 0; i < scores.length; i++) {
          if (socket.id == scores[i].id) {
            sc = scores[i];
            break;
          }
        }
        
        blob.x = data.x;
        blob.y = data.y;
        blob.r = data.r;

        sc.score = data.r;

        var length = miniblobs.length;
        if(length < nMiniblobs){
          miniblobs = repairMiniBlobs(miniblobs,length,nMiniblobs);          
        }
      }
    );

    socket.on('disconnect', function() {
      blobs = blobs.filter(function( obj ) {
          return obj.id !== socket.id;
      });
      scores = scores.filter(function( obj ) {
          return obj.id !== socket.id;
      });
      console.log("Client " + socket.id+ " has disconnected");
    });


    socket.on('eat',
      function(data){
        console.log(data.id + " have been eaten");
        socket.broadcast.to(data.id).emit('the_end', "You have been eaten");
      }
    );
  }
);
