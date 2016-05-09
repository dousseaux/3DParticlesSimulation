var World = function() {

    this.canvas = document.getElementById("screen");
    this.gl = initWebGL(this.canvas);
    initViewport(this.gl, this.canvas);
    this.shader = createShaderProgram(this.gl, vShaderString, fShaderString);
    this.scene = new scene(this.gl, this.canvas);

    this.size = {x: 200, y: 150, z: 200};
    this.dt = 0.015;
    this.friction = 0;
    this.thrust = 100.0;
    this.wallSpring = 400.0;
    this.eps = 1e6;
    this.maxvelocity = 80.0;
    this.gravity = 0.0;
    this.colorBackup = [];
    this.id = 0;
    this.animationID = null;
    this.view = null;

    var self = this;

    this.simulate = function() {
        self.update();
        self.animationID = requestAnimationFrame(self.simulate);
    };
};

World.prototype = {

    update: function() {

        for (var i = 0; i < this.bodies.length-1; i++) this.bodies[i].interact(this.bodies[i+1]);

        for (var i = 0; i < this.bodies.length; i++) if(this.bodies[i].step !== undefined) this.bodies[i].step();

        this.time += this.dt;
    },

    setup: function(n) {

       this.time = 0;
       this.bodies = [];
       this.selected = [];
       this.walls = [];
       this.edges = [];
       var self = this;

       this.view.interactCode1.value = "force1 = -(distance-50)*(distance-50)*(distance-50);";
       this.view.interactCode2.value = "force2 = -force1;";
       this.view.gravityInput.value = this.gravity;
       this.view.frictionInput.value = this.friction;

       if(this.scene.up.x === 0 && this.scene.up.y === 1 && this.scene.up.z === 0){
         this.scene.camera.z = 600;
         this.scene.far = 3000;
         this.scene.updateCamera();
         this.scene.updateProjection();
        }

       addEdges(this);

       // Add the player.
       this.id = 0;
       this.addBody();
       this.player = this.bodies[this.bodies.length-1];
       this.player.jump = 0;
       this.player.position.x = -0.1;
       this.addBody();

       for(var i=0; i<n; i++) this.addBody();


    },

    draw: function() {

       this.scene.draw();

       for (var i = 0; i < this.bodies.length; i++) {
          this.bodies[i].updateModel();
          this.bodies[i].sphere.draw();
      }

       for(var i=0; i<this.edges.length; i++) this.edges[i].draw();
       for (var i = 0; i < this.walls.length; i++) this.walls[i].square.draw();
    },

    addBody: function() {
       var body = new particle(this, this.id);
       body.sphere.color = [Math.random(), Math.random(), Math.random(), 1.0];
       body.position = {x: Math.random()*100, y: Math.random()*100, z: Math.random()*100};
       body.radius = 7;
       body.velocity.x = 50.0;
       body.velocity.y = 50.0;
       body.velocity.z = 50.0;
       this.bodies.push(body);
       this.selected.push(0);
       this.colorBackup.push(body.sphere.color);
       this.id++;
    },

    removeBody: function(body) {
       var bodyIndex = this.bodies.indexOf(body);
       if (bodyIndex !== -1){
          this.selected[body.id] = 0;
          this.bodies.splice(bodyIndex, 1);
      }
    },
};

// ------------------------- PARTICLES PHYSICS DEFINITION -----------------------------
particle.prototype = {

  interact: function(body) {

        if (this.mass < 0.0 && body.mass < 0.0) return;

        var x1 = this.position.x;
        var y1 = this.position.y;
        var z1 = this.position.z;

        var x2 = body.position.x;
        var y2 = body.position.y;
        var z2 = body.position.z;

        var dx = x1 - x2;
        var dy = y1 - y2;
        var dz = z1 - z2;

        var distance = Math.sqrt(dx*dx+dy*dy+dz*dz);

        var force1 = -(distance-50)*(distance-50)*(distance-50);
        var force2 = -force1;

        this.force.x = dx/distance*force1;
        this.force.y = dy/distance*force1;
        this.force.z = dz/distance*force1;

        this.force.x -= this.world.friction*this.velocity.x;
        this.force.y -= this.world.friction*this.velocity.y;
        this.force.z -= this.world.friction*this.velocity.z;

        body.force.x = dx/distance*force2;
        body.force.y = dy/distance*force2;
        body.force.z = dz/distance*force2;

        body.force.x -= body.world.friction*body.velocity.x;
        body.force.y -= body.world.friction*body.velocity.y;
        body.force.z -= body.world.friction*body.velocity.z;
   },

   step: function() {

       // Ignore fixed bodies.
       if (this.mass <= 0.0) return;

       if (this.position.x-this.radius < -this.world.size.x){
         this.force.x += -this.world.wallSpring*(this.position.x-this.radius+this.world.size.x);
         this.velocity.x = -this.velocity.x;
       }else if (this.position.x+this.radius > this.world.size.x){
         this.force.x += -this.world.wallSpring*(this.position.x+this.radius-this.world.size.x);
         this.velocity.x = -this.velocity.x;
       }

       if (this.position.y-this.radius < -this.world.size.y){
         this.force.y += -this.world.wallSpring*(this.position.y-this.radius+this.world.size.y);
         this.velocity.y = -this.velocity.y;
       }else if (this.position.y+this.radius > this.world.size.y){
         this.force.y += -this.world.wallSpring*(this.position.y+this.radius-this.world.size.y);
         this.velocity.y = -this.velocity.y;
       }

       if (this.position.z-this.radius < -this.world.size.z){
         this.force.z += -this.world.wallSpring*(this.position.z-this.radius+this.world.size.z);
         this.velocity.z = -this.velocity.z;
       }else if (this.position.z+this.radius > this.world.size.z){
         this.force.z += -this.world.wallSpring*(this.position.z+this.radius-this.world.size.z);
         this.velocity.z = -this.velocity.z;
       }

       this.velocity.x += this.force.x/this.mass*this.world.dt;
       this.velocity.y += this.force.y/this.mass*this.world.dt + this.world.gravity;
       this.velocity.z += this.force.z/this.mass*this.world.dt;

       if (this.velocity.x > this.world.maxvelocity) this.velocity.x = this.world.maxvelocity;
       if (this.velocity.x < -this.world.maxvelocity) this.velocity.x = -this.world.maxvelocity;
       if (this.velocity.y > this.world.maxvelocity) this.velocity.y = this.world.maxvelocity;
       if (this.velocity.y < -this.world.maxvelocity) this.velocity.y = -this.world.maxvelocity;
       if (this.velocity.z > this.world.maxvelocity) this.velocity.z = this.world.maxvelocity;
       if (this.velocity.z < -this.world.maxvelocity) this.velocity.z = -this.world.maxvelocity;

       // Leap frog integration.
       this.position.x += this.velocity.x*this.world.dt;
       this.position.y += this.velocity.y*this.world.dt;
       this.position.z += this.velocity.z*this.world.dt;
   }
};

// ---------------------------- ADD WALLS TO A WORLD ----------------------------------
function addWalls(world){

  world.walls = [];
  for(var i=0; i<6; i++) world.walls.push(new wall(world));

  world.walls[0].position.z = -world.size.z;
  world.walls[0].rotation.x = -Math.PI;
  world.walls[0].height = 2*world.size.y;
  world.walls[0].width = 2*world.size.x;

  world.walls[1].position.z = world.size.z;
  world.walls[1].height = 2*world.size.y;
  world.walls[1].width = 2*world.size.x;

  world.walls[2].position.x = -world.size.x;
  world.walls[2].rotation.y = Math.PI/2;
  world.walls[2].height = 2*world.size.y;
  world.walls[2].width = 2*world.size.x;

  world.walls[3].position.x = world.size.x;
  world.walls[3].rotation.y = Math.PI/2;
  world.walls[3].height = 2*world.size.y;
  world.walls[3].width = 2*world.size.x;

  world.walls[4].position.y = world.size.y;
  world.walls[4].rotation.x = Math.PI/2;
  world.walls[4].height = 2*world.size.z;
  world.walls[4].width = 2*world.size.x;

  world.walls[5].position.y = -world.size.y;
  world.walls[5].rotation.x = Math.PI/2;
  world.walls[5].height = 2*world.size.z;
  world.walls[5].width = 2*world.size.x;

  for(var i=0; i<world.walls.length; i++) world.walls[i].updateModel();
}

function addEdges(world){
  world.edges = [];
  for(var i=0; i<12; i++)world.edges.push(new line(world.scene, world.shader));

  world.edges[0].p1 = {x: world.size.x, y: world.size.y, z: world.size.z}
  world.edges[0].p2 = {x:-world.size.x, y: world.size.y, z: world.size.z}
  world.edges[1].p1 = {x: world.size.x, y: world.size.y, z: world.size.z}
  world.edges[1].p2 = {x: world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[2].p1 = {x: world.size.x, y: world.size.y, z: world.size.z}
  world.edges[2].p2 = {x: world.size.x, y: world.size.y, z:-world.size.z}
  world.edges[3].p1 = {x:-world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[3].p2 = {x:-world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[4].p1 = {x:-world.size.x, y: world.size.y, z: world.size.z}
  world.edges[4].p2 = {x:-world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[5].p1 = {x:-world.size.x, y: world.size.y, z: world.size.z}
  world.edges[5].p2 = {x:-world.size.x, y: world.size.y, z:-world.size.z}
  world.edges[6].p1 = {x: world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[6].p2 = {x: world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[7].p1 = {x: world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[7].p2 = {x:-world.size.x, y:-world.size.y, z: world.size.z}
  world.edges[8].p1 = {x: world.size.x, y: world.size.y, z:-world.size.z}
  world.edges[8].p2 = {x:-world.size.x, y: world.size.y, z:-world.size.z}
  world.edges[9].p1 = {x: world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[9].p2 = {x:-world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[10].p1= {x: world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[10].p2= {x: world.size.x, y: world.size.y, z:-world.size.z}
  world.edges[11].p1= {x:-world.size.x, y:-world.size.y, z:-world.size.z}
  world.edges[11].p2= {x:-world.size.x, y: world.size.y, z:-world.size.z}

  for(var i=0; i<world.edges.length; i++){
    world.edges[i].lineWidth = 1.5;
    world.edges[i].color = [0.88, 1.34, 1.38, 1];
    world.edges[i].updateModel();
  }
}

// -------------------------- CREATES A HTML TABLE ROW --------------------------------
function addRow(body){

   row = "<tr>" +
            "<td>" + body.id + "</td>" +
            "<td>" + body.velocity.x.toFixed(3) + "</td>" +
            "<td>" + body.velocity.y.toFixed(3) + "</td>" +
            "<td>" + body.velocity.z.toFixed(3) + "</td>" +
            "<td>" + body.force.x.toFixed(3) + "</td>" +
            "<td>" + body.force.y.toFixed(3) + "</td>" +
            "<td>" + body.force.z.toFixed(3) + "</td>" +
         "</tr>";

  return row;
}

// -------------------------------- INTIALIZATION -------------------------------------
window.onload = function(){

    var w = new World();
    var v = new view(w);

    w.view = v;

    w.setup();
    w.simulate();

    w.view.startRender();
};
