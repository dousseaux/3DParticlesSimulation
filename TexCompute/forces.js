var World = function() {

    this.canvas = document.getElementById("screen");
    this.gl = initWebGL(this.canvas);
    initViewport(this.gl, this.canvas);
    this.shader = createShaderProgram(this.gl, document.getElementById('DVertexShader').text, document.getElementById('DFragmentShader').text);
    this.scene = new scene(this.gl, this.canvas);

    //console.log(this.gl.getSupportedExtensions());
    this.size = {x: 1000, y: 800, z: 1000};
    this.dt = 0.015;
    this.dt2 = this.dt*this.dt;
    this.friction = 0;
    this.wallSpring = 400.0;
    this.maxvelocity = 80.0;
    this.gravity = 0.0;
    this.texsize = {x:256, y:256};

    this.colorBackup = [];
    this.id = 0;
    this.animationID = null;
    this.view = null;

    this.data = {
        position: new Float32Array(this.texsize.x*this.texsize.y*4),
        force: new Float32Array(this.texsize.x*this.texsize.y*4),
        mass: new Float32Array(this.texsize.x*this.texsize.y*1),
        distance: new Float32Array(this.texsize.x*this.texsize.y*4),
        radius: new Float32Array(this.texsize.x*this.texsize.y*1),
        velocity: new Float32Array(this.texsize.x*this.texsize.y*4),
        ids:  0,
        colors: new Float32Array(4*this.texsize.x*this.texsize.y*4),
    }

    var CVShader = document.getElementById('CVertexShader').text;
    var CFShader = [];
    CFShader.push(document.getElementById('CFragmentShader0').text);
    CFShader.push(document.getElementById('CFragmentShader1').text);
    CFShader.push(document.getElementById('CFragmentShader2').text);
    CFShader.push(document.getElementById('CFragmentShader3').text);

    this.compshaders = [];
    this.compshaders.push(createShaderProgram(this.gl, CVShader, CFShader[0]));
    this.compshaders.push(createShaderProgram(this.gl, CVShader, CFShader[1]));
    this.compshaders.push(createShaderProgram(this.gl, CVShader, CFShader[2]));
    this.compshaders.push(createShaderProgram(this.gl, CVShader, CFShader[3]));

    this.gl.getExtension("OES_texture_float");
    this.gl.getExtension("OES_texture_float_linear");
    this.gl.getExtension("WEBGL_color_buffer_float");
    this.gl.getExtension("EXT_sRGB");

    var self = this;

    this.saveModel = function(){
        self.view.pause.click();
        self.updateBodies();
        self.data.id = self.id;
        self.view.downloader.href = dataToJSON(self.data);
        self.view.downloader.download = "3DParticlesdata.json";
        self.view.downloader.click();
        self.view.pause.click();
    }

    this.uploadModel = function(){
        var reader = new FileReader();
        var file = self.view.uploader.files[self.view.uploader.files.length-1]
        reader.readAsText(file, "UTF-8");
        reader.onload = function(e){
            var temp = JSON.parse(e.target.result);
            self.data.id = temp.id;
            self.view.pause.click();
            self.gpucomp.state = true;
            self.id = temp.id;
            self.data.position = new Float32Array(objToArray(temp.position));
            self.data.mass = new Float32Array(objToArray(temp.mass));
            self.data.radius = new Float32Array(objToArray(temp.radius));
            self.data.velocity = new Float32Array(objToArray(temp.velocity));
            self.data.colors = new Float32Array(objToArray(temp.colors));
            updateTexture4d(self.gpucomp.gl, self.texsize, self.gpucomp.position, self.data.position);
            updateTexture4d(self.gpucomp.gl, self.texsize, self.gpucomp.velocity, self.data.velocity);
            updateTexture1d(self.gpucomp.gl, self.texsize, self.gpucomp.radius, self.data.radius);
            updateTexture1d(self.gpucomp.gl, self.texsize, self.gpucomp.mass, self.data.mass);
            updateTexture4d(self.gpucomp.gl, self.texsize, self.scene.spheres.colorTex, self.data.colors);
            self.scene.spheres.update();
            self.update();
            self.view.updateInfo();
            self.view.render();
            self.view.pause.click();
        }
    }

    this.addTime = function() {
        self.Realtime += 0.1;
    }

    this.simulate = function() {
        self.timeIntervalID = window.setInterval(self.addTime, 100);
        self.update();
    }

    this.update = function() {
        self.gpucomp.compute1();
        self.time += self.dt;
        self.animationID = requestAnimationFrame(self.update);
    }
};

World.prototype = {

    setup: function() {
       this.time = 0;
       this.Realtime = 0
       this.bodies = [];
       this.selected = [];
       this.walls = [];
       this.edges = [];
       var self = this;

       this.view.gravityInput.value = this.gravity;
       this.view.frictionInput.value = this.friction;

       if(this.scene.up.x === 0 && this.scene.up.y === 1 && this.scene.up.z === 0){
         this.scene.camera.z = 600;
         this.scene.far = 3000;
         this.scene.updateCamera();
         this.scene.updateProjection();
        }

       //addEdges(this);

       this.gpucomp = new physicsComputingRender(this, this.compshaders, this.data);
       this.scene.spheres = new spheres(this.scene, this.data, this.shader, this.gpucomp.position, this.gpucomp.radius, this.gpucomp.size);

       this.id = 0;
       this.addBody();
       this.addBody();
    },

    draw: function() {
      this.scene.draw();
      for(var i=0; i<this.edges.length; i++) this.edges[i].draw();
      for (var i = 0; i < this.walls.length; i++) this.walls[i].square.draw();
    },

    addBody: function() {
        var color = [Math.random(), Math.random(), Math.random(), 1.0];
        var body = new particle(this, this.id, color, false);

        body.position = {x: Math.random()*100, y: Math.random()*100, z: Math.random()*100};
        body.radius = 7;
        body.velocity.x = 50.0;
        body.velocity.y = 50.0;
        body.velocity.z = 50.0;

        getFrameData4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.FBvelocity, this.data.velocity);
        getFrameData4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.FBposition, this.data.position);

        this.data.position[this.id*4] = body.position.x;
        this.data.position[this.id*4 + 1] = body.position.y;
        this.data.position[this.id*4 + 2] = body.position.z;
        this.data.velocity[this.id*4] = body.velocity.x;
        this.data.velocity[this.id*4 + 1] = body.velocity.y;
        this.data.velocity[this.id*4 + 2] = body.velocity.z;
        this.data.mass[this.id] = body.mass;
        this.data.radius[this.id] = body.radius;

        updateTexture4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.position, this.data.position);
        updateTexture4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.velocity, this.data.velocity);
        updateTexture1d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.radius, this.data.radius);
        updateTexture1d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.mass, this.data.mass);
        this.gpucomp.state = true;
        this.gpucomp.compute1();

        this.bodies.push(body);
        this.selected.push(0);
        this.colorBackup.push(body.color);
        this.id++;
    },

    addMultBody: function(n){

        this.view.pause.click();

        var count = 0;
        var self = this;

        function finish(){
            self.scene.spheres.finishFastAdd();
            updateTexture4d(self.gpucomp.gl, self.gpucomp.size, self.gpucomp.position, self.data.position);
            updateTexture4d(self.gpucomp.gl, self.gpucomp.size, self.gpucomp.velocity, self.data.velocity);
            updateTexture1d(self.gpucomp.gl, self.gpucomp.size, self.gpucomp.radius, self.data.radius);
            updateTexture1d(self.gpucomp.gl, self.gpucomp.size, self.gpucomp.mass, self.data.mass);
            self.gpucomp.state = true;
            self.gpucomp.compute1();
        }

        function add(){
            var color = [Math.random(), Math.random(), Math.random(), 1.0];
            var body = new particle(self, self.id, color, true);

            body.position = {x: Math.random()*100, y: Math.random()*100, z: Math.random()*100};
            body.radius = 7;
            body.velocity.x = 50.0;
            body.velocity.y = 50.0;
            body.velocity.z = 50.0;

            self.data.position[self.id*4] = body.position.x;
            self.data.position[self.id*4 + 1] = body.position.y;
            self.data.position[self.id*4 + 2] = body.position.z;
            self.data.velocity[self.id*4] = body.velocity.x;
            self.data.velocity[self.id*4 + 1] = body.velocity.y;
            self.data.velocity[self.id*4 + 2] = body.velocity.z;
            self.data.mass[self.id] = body.mass;
            self.data.radius[self.id] = body.radius;

            self.bodies.push(body);
            self.selected.push(0);
            self.colorBackup.push(body.color);
            self.id++;
            self.view.particles.innerHTML = "Particles: " + self.id;
        }

        this.animate = function(){
            if(count < n){
                count++;
                add();
                requestAnimationFrame(self.animate);
            }else finish();
        }

        this.updateBodies();
        this.scene.spheres.prepareFastAdd();
        this.animate();

    },

    updateBodies: function(){

        getFrameData4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.FBposition, this.data.position);
        getFrameData4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.FBvelocity, this.data.velocity);
        getFrameData4d(this.gpucomp.gl, this.gpucomp.size, this.gpucomp.FBforce, this.data.force);
        for(var i=0; i<this.bodies.length; i++){
            this.bodies[i].position.x = this.data.position[4*i];
            this.bodies[i].position.y = this.data.position[4*i + 1];
            this.bodies[i].position.z = this.data.position[4*i + 2];
            this.bodies[i].velocity.x = this.data.velocity[4*i];
            this.bodies[i].velocity.y = this.data.velocity[4*i + 1];
            this.bodies[i].velocity.z = this.data.velocity[4*i + 2];
            this.bodies[i].force.x = this.data.force[4*i];
            this.bodies[i].force.y = this.data.force[4*i + 1];
            this.bodies[i].force.z = this.data.force[4*i + 2];
        }
    },

    removeBody: function(body) {
       var bodyIndex = this.bodies.indexOf(body);
       if (bodyIndex !== -1){
          this.selected[body.id] = 0;
          this.bodies.splice(bodyIndex, 1);
      }
    },
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

    this.world = new World();
    this.view = new view(this.world);

    this.world.view = this.view;

    world.setup();
    world.simulate();
    this.view.startRender()
};
