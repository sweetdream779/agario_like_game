var scal = 2;
function Blob(x, y, r) {
  this.x = x;
  this.y = y;
  this.r = r;
  this.vel = createVector(0, 0);

  this.update = function() {
    var newvel = createVector(mouseX - width / 2, mouseY - height / 2);
    newvel.div(50);
    //newvel.setMag(3);
    newvel.limit(3);
    this.vel.lerp(newvel, 0.2);
    var pos = createVector(this.x, this.y);
    pos.add(this.vel);
    this.x = pos.x;
    this.y = pos.y;
  }

  this.eats = function(other) {
    var pos1 = createVector(this.x, this.y);
    var pos2 = createVector(other.x, other.y);
    var d = p5.Vector.dist(pos1, pos2);
    //console.log("d: " + d);
    if (d < this.r + other.r && this.r > other.r) {
      var sum = PI * this.r * this.r + PI * other.r * other.r;
      this.r = sqrt(sum / PI);
      //this.r += other.r;
      return true;
    } else {
      return false;
    }
  }

  this.constrain = function() {
    blob.x = constrain(blob.x, -width / scal, width / scal);
    blob.y = constrain(blob.y, -height / scal, height / scal);
  }

  this.show = function(R,G,B) {
    fill(R,G,B);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
  }
}
