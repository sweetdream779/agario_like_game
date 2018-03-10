var socket;

var blob;

var blobs = [];
var miniblobs = [];
var scores = [];

var zoom = 1;
var deleted = false;

var scal = 2;

var w = 1000;
var h = 800;

function setup() {
  createCanvas(w, h);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:3000');

  socket.on('the_end',
    function(data) {
      console.log(data);
      socket.disconnect();
      deleted = true;
      //blobs = [];
      //clear();
      noLoop();
    }
  );

  blob = new Blob(random(width), random(height), random(8, 10));

  var data = {
    x: blob.x,
    y: blob.y,
    r: blob.r
  };


  socket.emit('start', data);

  socket.on('heartbeat',
    function(data) {
      blobs = data.blobs;
      miniblobs = data.miniblobs;
      scores = data.scores;
    }
  );
}

function draw() {
  background(0);
  
  //print user id
  textSize(18);
  var l = str(socket.id).length; 
  text(str(socket.id), width/scal -l, 30);

  //print all scores
  function compare(a,b) {
    if (a.score > b.score)
      return -1;
    else
      return 1;
    return 0;
  }
  scores.sort(compare);

  textSize(10);
  text("Scores", 50, 10);
  for(var i = 0; i < scores.length; i++){
    textSize(10);
    var res = str(scores[i].id).concat("         ");
    var len = 10;
    var name =  res.substr(0, len);
    text(name + ": " + str(parseInt(scores[i].score)), 50, 30+13*i);
  }

  //console.log(blob.x, blob.y);
  //move camera
  translate(width / 2, height / 2);
  var newzoom = 64 / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);
  translate(-blob.x, -blob.y);


  fill('rgba(105,105,105, 0.15)');
  rect(-width / scal,-height/scal, 2*width/scal, 2*height/scal);


  for (var i = 0; i < blobs.length; i++) {
    var id = blobs[i].id;

    if (id == socket.id) {
      continue;
    }

      fill(0, 0, 255);
      ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);

      fill(255);
      textAlign(CENTER);
      textSize(4);
      text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);
    
      if (blob.eats(blobs[i])) {
        var data = {
          id: blobs[i].id
        };
        console.log(socket.id + " ate " + blobs[i].id);
        socket.emit('eat', data);

      }
  }
  for (var i = 0; i < miniblobs.length; i++) {
      fill(253,95,0);
      ellipse(miniblobs[i].x, miniblobs[i].y, miniblobs[i].r * 2, miniblobs[i].r * 2);

      if (blob.eats(miniblobs[i])) {
        console.log(socket.id + " ate one miniblob");
        miniblobs.splice(i, 1);
      }
  }



  if (deleted){
    textSize(14);
    text('You have been eaten', 30, 30);
  }
  else{

    blob.show(255,255,255);
    if (mouseIsPressed) {
      blob.update();
    }
    blob.constrain();

    var data = {
      x: blob.x,
      y: blob.y,
      r: blob.r,
      miniblobs: miniblobs
    };
    socket.emit('update', data);
  }


}
