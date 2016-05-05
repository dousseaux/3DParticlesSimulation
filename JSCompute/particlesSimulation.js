var scene = function(gl, canvas){

    this.gl = gl;
    this.canvas = canvas;

    // GRAPHICS MATRICES
    this.projectionMatrix = [];
    this.viewMatrix = [];

    // PERSPECTIVE VIEW PARAMETERS
    this.fov = 45;
    this.aspect = canvas.width / canvas.height;

    this.far = 40;
    this.near = 0.1;

    // ORTHOGONAL VIEW PARAMETERS
    this.bottom = -8;
    this.top    =  8;
    this.left   = -8;
    this.right  =  8;

    // VIEW PARAMETERS
    this.camera = {x:0, y: 0, z:10};
    scene.camerad = 10;
    this.look = {x:0, y:0, z:0};
    this.up = {x:0, y:1, z:0};
    this.xaxis = {x:1, y:0, z:0};
    this.zaxis = {x:0, y:0, z:1};

    // SPHERE PARAMETERS
    this.sphereLongitude = 15;
    this.sphereLatitude = 15;
    this.sphereVertex = this.sphereLatitude * this.sphereLongitude * 6;

    // SET PROJECTION MODE
    this.projectionMode = 1;

    // LIGHT PARAMETERS
    this.light = [4, -3, -5];
    this.lightmode = 0.0;

    // BUFFERS
    this.sphereNormalBuffer = [];
    this.sphereVertexBuffer = [];
    this.squareNormalBuffer = [];
    this.squareVertexBuffer = [];
    this.lineNormalBuffer = [];
    this.lineVertexBuffer = [];

    // SHADERS
    this.shaderPrograms = [];

    // UPDATE CAMERA
    var thisScene = this;
    this.updateCamera = function(){viewMatrix(thisScene)};
    this.updateProjection = function(){projectionMatrix(thisScene)};

    this.selected = null;

    // ENABLE DEPTH
    this.gl.enable(this.gl.DEPTH_TEST);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // INTIALIZE PROJECTION MATRIX
    projectionMatrix(this);

    // INTIALIZE VIEW MATRIX
    viewMatrix(this);

    // CREATE BUFFERS WITH VERTEX INFORMATIONS
    createsphereBuffer(this, this.sphereLatitude, this.sphereLongitude);
    createsquareBuffer(this);
    createlineBuffer(this);

    this.draw = function(){
        // CLEAR BUFFERS
        world.gl.bindFramebuffer(world.gl.FRAMEBUFFER, null);
        initViewport(gl, this.canvas);
        this.gl.clearColor(0.05, 0.05, 0.1, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}

// -------------------------------------- SPHERE OBJECT----------------------------------
var sphere = function(scene, shader){

    // VARIABLES
    this.gl = scene.gl;
    this.shader = shader;
    this.scene = scene;

    // CREATE MODEL MATRICES
    this.translation      = [];
    this.xrotation        = [];
    this.yrotation        = [];
    this.zrotation        = [];
    this.scalem           = [];

    // SCALE PARAMETERS
    this.scale = {x:1, y:1, z:1};
    // ROTATION ANGLES
    this.angle = {x:0, y:0, z:0};
    // TRANSLATION PARAMETERS
    this.translate = {x:0, y:0, z:0};

    this.shininess = 10;
    this.color = [0.5, 0.5, 0.5, 1];

    // INITIALIZE MODEL MATRIX
    modelMatrix(this);

    // LINK BUFFERS WITH SHADER ATTRIBUTES

    this.shaderVertexNormalAttribute = this.gl.getAttribLocation(this.shader, "vNormal");
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shader, "vertexPos");

    // SET SHADER VARIABLES POINTERS
    this.projectionMatrixUniform = this.gl.getUniformLocation(this.shader, "projectionMatrix");
    this.translationUniform = this.gl.getUniformLocation(this.shader, "translation");
    this.rotationxUniform = this.gl.getUniformLocation(this.shader, "xrotation");
    this.rotationyUniform = this.gl.getUniformLocation(this.shader, "yrotation");
    this.rotationzUniform = this.gl.getUniformLocation(this.shader, "zrotation");
    this.scaleUniform = this.gl.getUniformLocation(this.shader, "scale");
    this.viewMatrixUniform = this.gl.getUniformLocation(this.shader, "viewMatrix");
    this.lightUniform = this.gl.getUniformLocation(this.shader, "light");
    this.lightModeUniform = this.gl.getUniformLocation(this.shader, "lightmode");
    this.shininessUniform = this.gl.getUniformLocation(this.shader, "shininess");
    this.colorUniform = this.gl.getUniformLocation(this.shader, "color")

    var self = this;

    this.updateModel = function(){modelMatrix(self)};
    // DRAW OBJECT
    this.draw =  function() {

        // SET SHADER TO BE USED
        this.gl.useProgram(this.shader);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.sphereNormalBuffer);
        this.gl.enableVertexAttribArray(this.shaderVertexNormalAttribute);
        this.gl.vertexAttribPointer(this.shaderVertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.sphereVertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

        // LINK SHADER UNIFORMS WITH OBJECT VARIABLES
        this.gl.uniformMatrix4fv(this.translationUniform, false, this.translation);
        this.gl.uniformMatrix4fv(this.rotationxUniform, false, this.xrotation);
        this.gl.uniformMatrix4fv(this.rotationyUniform, false, this.yrotation);
        this.gl.uniformMatrix4fv(this.rotationzUniform, false, this.zrotation);
        this.gl.uniformMatrix4fv(this.scaleUniform, false, this.scalem);

        this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, scene.viewMatrix);

        this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.scene.projectionMatrix);

        this.gl.uniform3fv(this.lightUniform, this.scene.light);
        this.gl.uniform1f(this.lightModeUniform, this.scene.lightmode);
        this.gl.uniform1f(this.shininessUniform, this.shininess);

        this.gl.uniform4fv(this.colorUniform, this.color);

        // DRAW
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.scene.sphereVertex);
    }
}

// -------------------------------------- SQUARE OBJECT ---------------------------------
var square = function(scene, shader){

    // VARIABLES
    this.gl = scene.gl;
    this.shader = shader;
    this.scene = scene;

    // CREATE MODEL MATRICES
    this.translation      = [];
    this.xrotation        = [];
    this.yrotation        = [];
    this.zrotation        = [];
    this.scalem           = [];

    // SCALE PARAMETERS
    this.scale = {x:1, y:1, z:1};
    // ROTATION ANGLES
    this.angle = {x:0, y:0, z:0};
    // TRANSLATION PARAMETERS
    this.translate = {x:0, y:0, z:0};

    this.shininess = 10;

    this.color = [0.5, 0.5, 0.5, 0.1];

    // INITIALIZE MODEL MATRIX
    modelMatrix(this);

    // LINK BUFFERS WITH SHADER ATTRIBUTES
    this.shaderVertexNormalAttribute = this.gl.getAttribLocation(this.shader, "vNormal");
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shader, "vertexPos");

    // SET SHADER VARIABLES POINTERS
    this.projectionMatrixUniform = this.gl.getUniformLocation(this.shader, "projectionMatrix");
    this.translationUniform = this.gl.getUniformLocation(this.shader, "translation");
    this.rotationxUniform = this.gl.getUniformLocation(this.shader, "xrotation");
    this.rotationyUniform = this.gl.getUniformLocation(this.shader, "yrotation");
    this.rotationzUniform = this.gl.getUniformLocation(this.shader, "zrotation");
    this.scaleUniform = this.gl.getUniformLocation(this.shader, "scale");
    this.viewMatrixUniform = this.gl.getUniformLocation(this.shader, "viewMatrix");
    this.lightUniform = this.gl.getUniformLocation(this.shader, "light");
    this.lightModeUniform = this.gl.getUniformLocation(this.shader, "lightmode");
    this.shininessUniform = this.gl.getUniformLocation(this.shader, "shininess");
    this.colorUniform = this.gl.getUniformLocation(this.shader, "color")

    var self = this;

    this.updateModel = function(){modelMatrix(self)};
    // DRAW OBJECT
    this.draw =  function() {

        // SET SHADER TO BE USED
        this.gl.useProgram(this.shader);

        // SET BUFFERS TO BE USED
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.squareNormalBuffer);
        this.gl.vertexAttribPointer(this.shaderVertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderVertexNormalAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

        // LINK SHADER UNIFORMS WITH OBJECT VARIABLES
        this.gl.uniformMatrix4fv(this.translationUniform, false, this.translation);
        this.gl.uniformMatrix4fv(this.rotationxUniform, false, this.xrotation);
        this.gl.uniformMatrix4fv(this.rotationyUniform, false, this.yrotation);
        this.gl.uniformMatrix4fv(this.rotationzUniform, false, this.zrotation);
        this.gl.uniformMatrix4fv(this.scaleUniform, false, this.scalem);
        this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, scene.viewMatrix);
        this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.scene.projectionMatrix);
        this.gl.uniform3fv(this.lightUniform, this.scene.light);
        this.gl.uniform1f(this.lightModeUniform, this.scene.lightmode);
        this.gl.uniform1f(this.shininessUniform, this.shininess);
        this.gl.uniform4fv(this.colorUniform, this.color);

        // DRAW
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}

// --------------------- CREATES A PSEUDO SCENE FOR GPU COMPUTATION ---------------------
var computingRender = function(size, dimension, shader, gl){

    // VARIABLES
    this.gl = gl;
    this.shaders = [];
    this.shader = shader;
    this.size = size;
    this.squareTexBuffer = [];
    this.squareVertexBuffer = [];
    this.textures = [];
    this.texUniforms = [];

    createsquareTexBuffer(this);
    this.vertexTexAttribute = gl.getAttribLocation(this.shader, "vTexPixels");
    this.vertexPositionAttribute = gl.getAttribLocation(this.shader, "vertexPos");

    this.outTex = createDataTexture(gl, size.x, size.y, new Float32Array(size.x*size.y*dimension), dimension);
    this.framebuffer = createTextureFrameBuffer(gl, size.x, size.y, this.outTex)

    this.addTexture = function(data, uniformName, d){
        this.textures.push(createDataTexture(this.gl, this.size.x, this.size.y, data, d));
        this.texUniforms.push(this.gl.getUniformLocation(this.shader, uniformName));
    }

    this.updateTexture = function(data, texnumber, d){
        this.textures[texnumber] = (createDataTexture(this.gl, this.size.x, this.size.y, data, d));
    }

    this.getFrameData = function(destinationBuffer){
        this.gl.readPixels(0, 0, this.size.x, this.size.y, this.gl.RGB, this.gl.FLOAT, destinationBuffer);
    }

    this.compute =  function() {

        this.gl.viewport(0, 0, this.size.x, this.size.y);

        this.gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

        // SET SHADER TO BE USED
        this.gl.useProgram(this.shader);

        // SET BUFFERS TO BE USED
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexBuffer);
        this.gl.vertexAttribPointer(this.vertexTexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexTexAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

        for(var i=0; i<this.textures.length; i++){
            this.gl.activeTexture(this.gl.TEXTURE0+i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i]);
            this.gl.uniform1i(this.texUniforms[i], i);
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}

// -------------------------------------- SQUARE OBJECT ---------------------------------
var line = function(scene, shader){

    // VARIABLES
    this.gl = scene.gl;
    this.shader = shader;
    this.scene = scene;

    // CREATE MODEL MATRICES
    this.translation      = [];
    this.xrotation        = [];
    this.yrotation        = [];
    this.zrotation        = [];
    this.scalem           = [];

    // SCALE PARAMETERS
    this.scale = {x:1, y:1, z:1};
    // ROTATION ANGLES
    this.angle = {x:0, y:0, z:0};
    // TRANSLATION PARAMETERS
    this.translate = {x:0, y:0, z:0};

    this.shininess = 10;
    this.color = [1.0, 0.0, 0.0, 1.0];
    this.lineWidth = 1;

    // INITIALIZE MODEL MATRIX
    modelMatrix(this);

    this.p1 = {x:0, y:0, z:0};
    this.p2 = {x:1, y:1, z:1};

    var self = this;

    this.updateModel = function(){
      self.translate.x = self.p1.x;
      self.translate.y = self.p1.y;
      self.translate.z = self.p1.z;
      self.scale.x = self.p2.x - self.p1.x;
      self.scale.y = self.p2.y - self.p1.y;
      self.scale.z = self.p2.z - self.p1.z;
      modelMatrix(self);
    }

    // LINK BUFFERS WITH SHADER ATTRIBUTES
    this.shaderVertexNormalAttribute = this.gl.getAttribLocation(this.shader, "vNormal");
    this.vertexPositionAttribute = this.gl.getAttribLocation(this.shader, "vertexPos");

    // SET SHADER VARIABLES POINTERS
    this.projectionMatrixUniform = this.gl.getUniformLocation(this.shader, "projectionMatrix");
    this.translationUniform = this.gl.getUniformLocation(this.shader, "translation");
    this.rotationxUniform = this.gl.getUniformLocation(this.shader, "xrotation");
    this.rotationyUniform = this.gl.getUniformLocation(this.shader, "yrotation");
    this.rotationzUniform = this.gl.getUniformLocation(this.shader, "zrotation");
    this.scaleUniform = this.gl.getUniformLocation(this.shader, "scale");
    this.viewMatrixUniform = this.gl.getUniformLocation(this.shader, "viewMatrix");
    this.lightUniform = this.gl.getUniformLocation(this.shader, "light");
    this.lightModeUniform = this.gl.getUniformLocation(this.shader, "lightmode");
    this.shininessUniform = this.gl.getUniformLocation(this.shader, "shininess");
    this.colorUniform = this.gl.getUniformLocation(this.shader, "color");

    // DRAW OBJECT
    this.draw =  function() {

        // SET SHADER TO BE USED
        this.gl.useProgram(this.shader);

        // SET BUFFERS TO BE USED
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.lineNormalBuffer);
        this.gl.vertexAttribPointer(this.shaderVertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.shaderVertexNormalAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.lineVertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

        // LINK SHADER UNIFORMS WITH OBJECT VARIABLES
        this.gl.uniformMatrix4fv(this.translationUniform, false, this.translation);
        this.gl.uniformMatrix4fv(this.rotationxUniform, false, this.xrotation);
        this.gl.uniformMatrix4fv(this.rotationyUniform, false, this.yrotation);
        this.gl.uniformMatrix4fv(this.rotationzUniform, false, this.zrotation);
        this.gl.uniformMatrix4fv(this.scaleUniform, false, this.scalem);
        this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, scene.viewMatrix);
        this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, this.scene.projectionMatrix);
        this.gl.uniform3fv(this.lightUniform, this.scene.light);
        this.gl.uniform1f(this.lightModeUniform, this.scene.lightmode);
        this.gl.uniform1f(this.shininessUniform, this.shininess);
        this.gl.uniform4fv(this.colorUniform, this.color);

        this.scene.gl.lineWidth(this.lineWidth);

        // DRAW
        this.gl.drawArrays(this.gl.LINES, 0, 2);
    }
}

// ------------------------------------ PARTICLE OBJECT --------------------------------
var particle = function(world, id){

    this.sphere = new sphere(world.scene, world.shader);
    this.world = world;
    this.id = id;

    this.position = {x:1, y:1, z:1};
    this.radius = 4;
    this.mass = this.radius*this.radius*this.radius;
    this.velocity = {x:0, y:0, z:0};
    this.force = {x:0, y:0, z:0};

    var self = this;

    this.updateModel = function(){

        self.sphere.translate.x = self.position.x;
        self.sphere.translate.y = self.position.y;
        self.sphere.translate.z = self.position.z;

        self.sphere.scale.x = self.radius;
        self.sphere.scale.y = self.radius;
        self.sphere.scale.z = self.radius;

        self.sphere.updateModel();
    }
}

// -------------------------------------- WALL OBJECT -----------------------------------
var wall = function(world){

    this.square = new square(world.scene, world.shader);
    var self = this;

    this.position = {x:0, y:0, z:0};
    this.rotation = {x:0, y:0, z:0};
    this.width = 1;
    this.height = 1;

    this.updateModel = function(){

        self.square.translate.x = self.position.x;
        self.square.translate.y = self.position.y;
        self.square.translate.z = self.position.z;

        self.square.angle.x = self.rotation.x;
        self.square.angle.y = self.rotation.y;
        self.square.angle.z = self.rotation.z;

        self.square.scale.x = self.width;
        self.square.scale.y = self.height;

        self.square.updateModel();
    }
}

// ------------------------------ CREATE GL BUFFER FOR A SPHERE -------------------------
function createsphereBuffer(scene, latitudeBands, longitudeBands) {

    var vertex = [];
    var normals = [];

    var vtemp = [];
    var ntemp = [];
    var ttemp = [];

    for(var i=0; i<=latitudeBands; i++){

        var theta =  i*Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for(var j=0; j<=longitudeBands; j++){

            var phi =  j*Math.PI*2 / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            vtemp.push(x);
            vtemp.push(y);
            vtemp.push(z);
            vtemp.push(1);

            ntemp.push(x);
            ntemp.push(y);
            ntemp.push(z);
        }
    }


    for(var i=0; i<latitudeBands; i++){
        for(var j=0; j<longitudeBands; j++){

            var first = (i*(latitudeBands + 1)) + j;
            var second = first + longitudeBands + 1;

            for(var k=0; k<4; k++) vertex.push(vtemp[4*first + k]);
            for(var k=0; k<4; k++) vertex.push(vtemp[4*second + k]);
            for(var k=0; k<4; k++) vertex.push(vtemp[4*(first + 1) + k]);

            for(var k=0; k<3; k++) normals.push(ntemp[3*first + k]);
            for(var k=0; k<3; k++) normals.push(ntemp[3*second + k]);
            for(var k=0; k<3; k++) normals.push(ntemp[3*(first + 1) + k]);

            for(var k=0; k<4; k++) vertex.push(vtemp[4*second + k]);
            for(var k=0; k<4; k++) vertex.push(vtemp[4*(second + 1) + k]);
            for(var k=0; k<4; k++) vertex.push(vtemp[4*(first + 1) + k]);

            for(var k=0; k<3; k++) normals.push(ntemp[3*second + k]);
            for(var k=0; k<3; k++) normals.push(ntemp[3*(second + 1) + k]);
            for(var k=0; k<3; k++) normals.push(ntemp[3*(first + 1) + k]);
        }
    }

    // CREATE BUFFERS
    scene.sphereNormalBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.sphereNormalBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(normals), scene.gl.STATIC_DRAW);

    scene.sphereVertexBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.sphereVertexBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(vertex), scene.gl.STATIC_DRAW);
}

// ----------------------------- CREATE GL BUFFER FOR A SQUARE --------------------------
function createsquareBuffer(scene) {

    var vertex = [
                        -0.5,  0.5,  0, 1.0,
                         0.5,  0.5,  0, 1.0,
                        -0.5, -0.5,  0, 1.0,
                        -0.5, -0.5,  0, 1.0,
                         0.5,  0.5,  0, 1.0,
                         0.5, -0.5,  0, 1.0,
                 ];

    var normals = [ 0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                  ]



    // CREATE BUFFERS
    scene.squareNormalBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.squareNormalBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(normals), scene.gl.STATIC_DRAW);

    scene.squareVertexBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.squareVertexBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(vertex), scene.gl.STATIC_DRAW);
}

// ----------------------------- CREATE GL BUFFER FOR A SQUARE --------------------------
function createsquareTexBuffer(scene) {

    var vertex = [
                        -1,  1,  0, 1,
                         1,  1,  0, 1,
                        -1, -1,  0, 1,
                        -1, -1,  0, 1,
                         1,  1,  0, 1,
                         1, -1,  0, 1
                 ];

    var texPixels = [ 0, 1,
                      1, 1,
                      0, 0,
                      0, 0,
                      1, 1,
                      1, 0
                    ]



    // CREATE BUFFERS
    scene.squareTexBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.squareTexBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(texPixels), scene.gl.STATIC_DRAW);

    scene.squareVertexBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.squareVertexBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(vertex), scene.gl.STATIC_DRAW);
}

// ----------------------------- CREATE GL BUFFER FOR A LINE --------------------------
function createlineBuffer(scene) {

    var vertex = [
                         0, 0, 0, 1.0,
                         1, 1, 1, 1.0,
                 ];

    var normals = [ 0, 0, 0,
                    0, 0, 0,
                  ];

    // CREATE BUFFERS
    scene.lineNormalBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.lineNormalBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(normals), scene.gl.STATIC_DRAW);

    scene.lineVertexBuffer = scene.gl.createBuffer();
    scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, scene.lineVertexBuffer);
    scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(vertex), scene.gl.STATIC_DRAW);
}

// -------------------------------- CREATE SHADER PROGRAM -------------------------------
function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource){

    function createShader(program, textype) {
        var shader;

        if (textype== "fragment") shader = gl.createShader(gl.FRAGMENT_SHADER);
        else if (textype == "vertex") shader = gl.createShader(gl.VERTEX_SHADER);
        else return null;

        gl.shaderSource(shader, program);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var fragmentShader = createShader(fragmentShaderSource, "fragment");
    var vertexShader = createShader(vertexShaderSource, "vertex");

    // Link the shaders into a program
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    return shaderProgram;
}

// ---------------------------------- CREATE TEXTURES -----------------------------------
function createTexture(gl, src){

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    var img = new Image();
    img.src = src;

    img.onload = function(){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.FLOAT, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
     };
}

function createDataTexture(gl, width, height, data, dimension){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);


    if(dimension === 1) gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, width, height, 0, gl.ALPHA, gl.FLOAT, data);
    else if(dimension === 2) gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE_ALPHA, width, height, 0, gl.LUMINANCE_ALPHA, gl.FLOAT, data);
    else if(dimension === 3) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.FLOAT, data);
    else if(dimension === 4) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);

    return texture;
}

function createTextureFrameBuffer(gl, x, y, texture){

    var frameBuffer = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return frameBuffer;
}

// ------------------------------ SET UP THE MODEL MATRIX -------------------------------
function modelMatrix(obj){

     var Sx = obj.scale.x;
     var Sy = obj.scale.y;
     var Sz = obj.scale.z;

     var Ax = obj.angle.x;
     var Ay = obj.angle.y;
     var Az = obj.angle.z;

     var Tx = obj.translate.x;
     var Ty = obj.translate.y;
     var Tz = obj.translate.z;

   // The transform matrix for the square - translate back in Z for the camera
   obj.translation = new Float32Array([
                                                    1,  0,  0,  0,
                                                    0,  1,  0,  0,
                                                    0,  0,  1,  0,
                                                   Tx, Ty, Tz, 1]);

    // The transform matrix for the square - translate back in Z for the camera
   obj.xrotation = new Float32Array([
                                                   1, 0, 0, 0,
                                                   0, Math.cos(Ax), -Math.sin(Ax), 0,
                                                   0, Math.sin(Ax),  Math.cos(Ax), 0,
                                                   0, 0, 0, 1]);

    obj.yrotation = new Float32Array([
                                                    Math.cos(Ay), 0, Math.sin(Ay), 0,
                                                   0            , 1, 0           , 0,
                                                   -Math.sin(Ay), 0, Math.cos(Ay), 0,
                                                   0, 0, 0, 1]);

    obj.zrotation = new Float32Array([
                                                   Math.cos(Az), -Math.sin(Az), 0, 0,
                                                   Math.sin(Az),  Math.cos(Az), 0, 0,
                                                   0, 0, 1, 0,
                                                   0, 0, 0, 1]);


    obj.scalem = new Float32Array([
                                                    Sx,  0,  0,  0,
                                                    0,  Sy,  0,  0,
                                                    0,  0,  Sz,  0,
                                                    0,  0,   0, 1]);

}

// -------------------------------- SET UP VIEW MATRIX ----------------------------------
function viewMatrix(scene){

        var Cx = scene.camera.x;
        var Cy = scene.camera.y;
        var Cz = scene.camera.z;

        var Lx = scene.look.x;
        var Ly = scene.look.y;
        var Lz = scene.look.z;

        var Upwardsx = scene.up.x;
        var Upwardsy = scene.up.y;
        var Upwardsz = scene.up.z;

        // Camera position minus look at
        var Wx = Cx - Lx;
        var Wy = Cy - Ly;
        var Wz = Cz - Lz;

        // Length of W
        var Wl = Math.sqrt(Wx*Wx + Wy*Wy + Wz*Wz);

        scene.camerad = Wl;

        // Normalize W
        Wx /= Wl;
        Wy /= Wl;
        Wz /= Wl;

        // Upwards cross W
        var Vx = Upwardsy*Wz - Upwardsz*Wy;
        var Vy = Upwardsz*Wx - Upwardsx*Wz;
        var Vz = Upwardsx*Wy - Upwardsy*Wx;

        // Length of V
        var Vl = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);

        // Normalize V
        Vx /= Vl;
        Vy /= Vl;
        Vz /= Vl;

        // W cross V
        var Ux = Wy*Vz - Wz*Vy;
        var Uy = Wz*Vx - Wx*Vz;
        var Uz = Wx*Vy - Wy*Vx;

        // Length of U
        var Ul = Math.sqrt(Ux*Ux + Uy*Uy + Uz*Uz);

        // Normalize U
        Ux /= Ul;
        Uy /= Ul;
        Uz /= Ul;

        scene.viewMatrix = new Float32Array([
                                               Vx, Vy, Vz, 0,
	                                             Ux, Uy, Uz, 0,
	                                             Wx, Wy, Wz, 0,
	                                            -Cx,-Cy,-Cz, 1]);
}

// -------------------------------- UPDATE CAMERA COORDS --------------------------------
function updateCamera(scene){

  scene.viewMatrix = inverse(scene.viewMatrix);

  scene.camera.x = scene.viewMatrix[12];
  scene.camera.y = scene.viewMatrix[13];
  scene.camera.z = scene.viewMatrix[14];
  scene.xaxis.x = scene.viewMatrix[0];
  scene.xaxis.y = scene.viewMatrix[1];
  scene.xaxis.z = scene.viewMatrix[2];
  scene.up.x = scene.viewMatrix[4];
  scene.up.y = scene.viewMatrix[5];
  scene.up.z = scene.viewMatrix[6];
  scene.zaxis.x = scene.viewMatrix[8];
  scene.zaxis.y = scene.viewMatrix[9];
  scene.zaxis.z = scene.viewMatrix[10];

  scene.viewMatrix = inverse(scene.viewMatrix);
}

// ------------------------------ SET UP PROJECTION MATRIX ------------------------------
function projectionMatrix(scene){

     var aspect = scene.aspect;
     var fov = scene.fov;

     var far = scene.far;
     var near = scene.near;

     var top = scene.top / aspect;
     var bottom = scene.bottom /  aspect;
     var left = scene.left;
     var right = scene.right;

     var d = near - far;

     fov = Math.PI*fov / 180;

     var f = Math.tan(Math.PI*0.5 - 0.5*fov);


    if(scene.projectionMode === 1){

        scene.projectionMatrix = new Float32Array(
                                                    [f / aspect   , 0            , 0               , 0                 ,
                                                     0            , f            , 0               , 0                 ,
                                                     0            , 0            , (far+near) / d  , -1                ,
                                                     0            , 0            , (2*far*near) / d, 0                 ]);
    }else{

        scene.projectionMatrix = new Float32Array(
                                                    [ 2/(right-left)             , 0                          , 0                       , 0,
                                                      0                          , 2/(top-bottom)             , 0                       , 0,
                                                      0                          , 0                          , -2/(far-near)           , 0,
                                                     -((right+left)/(right-left)),(-(top+bottom)/(top-bottom)), -((far+near)/(far-near)), 1]);
    }
}

// ---------------------------------- STARTS WEB GL -------------------------------------
function initWebGL(canvas) {

    var gl = null;

    var msg = "Your browser does not support WebGL, " + "or it is not enabled by default.";

    try{ gl = canvas.getContext("webgl")}
    catch(e){ msg = "Error creating WebGL Context!: " + e.toString()}

    if (!gl){
        alert(msg);
        throw new Error(msg);
    }

    return gl;
}

// -------------------------------- INITIALIZE VIEWPORT ---------------------------------
function initViewport(gl, canvas){
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// ---------------------------------- KEYBOARD HANDLER ----------------------------------
var Keyboarder = function(){

    var keyState = {};

    window.onkeydown = function(e){
        keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e){
        keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode){
        return keyState[keyCode] === true;
    };

    this.Keys = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32,
                 A: 65, S:83, D:68, W:87, PAGEUP: 33, PAGEDOWN: 34,
                 CTRL: 17, SHIFT: 16};
};

// ------------------------------- CALCULATE 4X4 INVERSE --------------------------------
var inverse = function(m){

    var index = function(i,j){
        return(m[4*(i-1) + j-1]);
    }

    var detm = index(1,1)*index(2,2)*index(3,3)*index(4,4) + index(1,1)*index(2,3)*index(3,4)*index(4,2) + index(1,1)*index(2,4)*index(3,2)*index(4,3) +
               index(1,2)*index(2,1)*index(3,4)*index(4,3) + index(1,2)*index(2,3)*index(3,1)*index(4,4) + index(1,2)*index(2,4)*index(3,3)*index(4,1) +
               index(1,3)*index(2,1)*index(3,2)*index(4,4) + index(1,3)*index(2,2)*index(3,4)*index(4,1) + index(1,3)*index(2,4)*index(3,1)*index(4,2) +
               index(1,4)*index(2,1)*index(3,3)*index(4,2) + index(1,4)*index(2,2)*index(3,1)*index(4,3) + index(1,4)*index(2,3)*index(3,2)*index(4,1) -
               index(1,1)*index(2,2)*index(3,4)*index(4,3) - index(1,1)*index(2,3)*index(3,2)*index(4,4) - index(1,1)*index(2,4)*index(3,3)*index(4,2) -
               index(1,2)*index(2,1)*index(3,3)*index(4,4) - index(1,2)*index(2,3)*index(3,4)*index(4,1) - index(1,2)*index(2,4)*index(3,1)*index(4,3) -
               index(1,3)*index(2,1)*index(3,4)*index(4,2) - index(1,3)*index(2,2)*index(3,1)*index(4,4) - index(1,3)*index(2,4)*index(3,2)*index(4,1) -
               index(1,4)*index(2,1)*index(3,2)*index(4,3) - index(1,4)*index(2,2)*index(3,3)*index(4,1) - index(1,4)*index(2,3)*index(3,1)*index(4,2);

    if(detm === 0) return 0;

    var b = new Float32Array([

        index(2,2)*index(3,3)*index(4,4)+index(2,3)*index(3,4)*index(4,2)+index(2,4)*index(3,2)*index(4,3) - index(2,2)*index(3,4)*index(4,3)-index(2,3)*index(3,2)*index(4,4)-index(2,4)*index(3,3)*index(4,2),
        index(1,2)*index(3,4)*index(4,3)+index(1,3)*index(3,2)*index(4,4)+index(1,4)*index(3,3)*index(4,2) - index(1,2)*index(3,3)*index(4,4)-index(1,3)*index(3,4)*index(4,2)-index(1,4)*index(3,2)*index(4,3),
        index(1,2)*index(2,3)*index(4,4)+index(1,3)*index(2,4)*index(4,2)+index(1,4)*index(2,2)*index(4,3) - index(1,2)*index(2,4)*index(4,3)-index(1,3)*index(2,2)*index(4,4)-index(1,4)*index(2,3)*index(4,2),
        index(1,2)*index(2,4)*index(3,3)+index(1,3)*index(2,2)*index(3,4)+index(1,4)*index(2,3)*index(3,4) - index(1,2)*index(2,3)*index(3,4)-index(1,3)*index(2,4)*index(3,2)-index(1,4)*index(2,2)*index(3,3),
        index(2,1)*index(3,4)*index(4,3)+index(2,3)*index(3,1)*index(4,4)+index(2,4)*index(3,3)*index(4,1) - index(2,1)*index(3,3)*index(4,4)-index(2,3)*index(3,4)*index(4,1)-index(2,4)*index(3,1)*index(4,3),
        index(1,1)*index(3,3)*index(4,4)+index(1,3)*index(3,4)*index(4,1)+index(1,4)*index(3,1)*index(4,3) - index(1,1)*index(3,4)*index(4,3)-index(1,3)*index(3,1)*index(4,4)-index(1,4)*index(3,3)*index(4,1),
        index(1,1)*index(2,4)*index(4,3)+index(1,3)*index(2,1)*index(4,4)+index(1,4)*index(2,3)*index(4,1) - index(1,1)*index(2,3)*index(4,4)-index(1,3)*index(2,4)*index(4,1)-index(1,4)*index(2,1)*index(4,3),
        index(1,1)*index(2,3)*index(3,4)+index(1,3)*index(2,4)*index(3,1)+index(1,4)*index(2,1)*index(3,3) - index(1,1)*index(2,4)*index(3,3)-index(1,3)*index(2,1)*index(3,4)-index(1,4)*index(2,3)*index(3,1),
        index(2,1)*index(3,2)*index(4,4)+index(2,2)*index(3,4)*index(4,1)+index(2,4)*index(3,1)*index(4,2) - index(2,1)*index(3,4)*index(4,2)-index(2,2)*index(3,1)*index(4,4)-index(2,4)*index(3,2)*index(4,1),
        index(1,1)*index(3,4)*index(4,2)+index(1,2)*index(3,1)*index(4,4)+index(1,4)*index(3,2)*index(4,1) - index(1,1)*index(3,2)*index(4,4)-index(1,2)*index(3,4)*index(4,1)-index(1,4)*index(3,1)*index(4,2),
        index(1,1)*index(2,2)*index(4,4)+index(1,2)*index(2,4)*index(4,1)+index(1,4)*index(2,1)*index(4,2) - index(1,1)*index(2,4)*index(4,2)-index(1,2)*index(2,1)*index(4,4)-index(1,4)*index(2,2)*index(4,1),
        index(1,1)*index(2,4)*index(3,2)+index(1,2)*index(2,1)*index(3,4)+index(1,4)*index(2,2)*index(3,1) - index(1,1)*index(2,2)*index(3,4)-index(1,2)*index(2,4)*index(3,1)-index(1,4)*index(2,1)*index(3,2),
        index(2,1)*index(3,3)*index(4,2)+index(2,2)*index(3,1)*index(4,3)+index(2,3)*index(3,2)*index(4,1) - index(2,1)*index(3,2)*index(4,3)-index(2,2)*index(3,3)*index(4,1)-index(2,3)*index(3,1)*index(4,2),
        index(1,1)*index(3,2)*index(4,3)+index(1,2)*index(3,3)*index(4,1)+index(1,3)*index(3,1)*index(4,2) - index(1,1)*index(3,3)*index(4,2)-index(1,2)*index(3,1)*index(4,3)-index(1,3)*index(3,2)*index(4,1),
        index(1,1)*index(2,3)*index(4,2)+index(1,2)*index(2,1)*index(4,3)+index(1,3)*index(2,2)*index(4,1) - index(1,1)*index(2,2)*index(4,3)-index(1,2)*index(2,3)*index(4,1)-index(1,3)*index(2,1)*index(4,2),
        index(1,1)*index(2,2)*index(3,3)+index(1,2)*index(2,3)*index(3,1)+index(1,3)*index(2,1)*index(3,2) - index(1,1)*index(2,3)*index(3,2)-index(1,2)*index(2,1)*index(3,3)-index(1,3)*index(2,2)*index(3,1)

    ])

    var inverse = [];

    for(var i=0; i<16; i++) inverse.push(b[i]/detm);

    return new Float32Array(inverse);
}

// ----------------------------------- MULTIPLY AXB -------------------------------------
function mult(a, b, factor){

    var result = [];

    for ( var i = 0; i < a.length/factor; ++i ) {
        for ( var j = 0; j < b.length/factor; ++j ) {
            var sum = 0.0;
            for ( var k = 0; k < factor; k++) sum += a[i*4 + k] * b[j + k*b.length/factor];
            result.push( sum );
        }
    }
    return result;
}

// --------------------------------- MOUSE SELECTION ------------------------------------
function mousePicking(mouse, scene, obj){

    var norms;
    var tp = scene.far;
    var x = -1 + (2*mouse.pos.x/scene.canvas.width);
    var y =  1 - (2*mouse.pos.y/scene.canvas.height);
    var ray_clip = [x , y, -1, 1];

    var ray_eye = mult(inverse(scene.projectionMatrix), ray_clip,4);
    ray_eye[2] = -1;
    ray_eye[3] =  0;

    var ray_world = mult(scene.viewMatrix, ray_eye,4);
    ray_world[3] = 0;

    norms = 0;
    for( var i=0; i<ray_world.length - 1; i++) norms += ray_world[i]*ray_world[i];
    norms = Math.sqrt(norms);
    for( var i=0; i<ray_world.length - 1; i++) ray_world[i] /= norms;

    for(var i=0; i<obj.length; i++){

        var b = scene.camera.x*ray_world[0] + scene.camera.y*ray_world[1] + scene.camera.z*ray_world[2] -
                obj[i].position.x*ray_world[0] - obj[i].position.y*ray_world[1] - obj[i].position.z*ray_world[2];

        var c = ray_world[0]*ray_world[0] + ray_world[1]*ray_world[1] + ray_world[2]*ray_world[2];

        var t = -b/c;

        px = scene.camera.x + t*ray_world[0];
        py = scene.camera.y + t*ray_world[1];
        pz = scene.camera.z + t*ray_world[2];

        d = (px-obj[i].position.x)*(px-obj[i].position.x) + (py-obj[i].position.y)*(py-obj[i].position.y) + (pz-obj[i].position.z)*(pz-obj[i].position.z)
         /*
        var b2 = ray_world[0]*(scene.camera.x - obj[i].position.x) +
                ray_world[1]*(scene.camera.y - obj[i].position.y) +
                ray_world[2]*(scene.camera.z - obj[i].position.z);

        var c2 = Math.pow(scene.camera.x,2) - 2*scene.camera.x*obj[i].position.x + Math.pow(obj[i].position.x,2)
              + Math.pow(scene.camera.y,2) - 2*scene.camera.y*obj[i].position.y + Math.pow(obj[i].position.y,2)
              + Math.pow(scene.camera.z,2) - 2*scene.camera.z*obj[i].position.z + Math.pow(obj[i].position.z,2)
              - Math.pow(obj[i].radius, 2);
        */

        if(d <= obj[i].radius*obj[i].radius  && t<tp){
            scene.selected = obj[i].id;
            tp = t;
        }
    }
}

// ------------------------- CAMERA MOVING AND AND OBJ MOVING ---------------------------
function mouseMoving(mouse, scene, obj){

    if(mouse.selected !== null && mouse.hold === true){

      var norms;
      var x = -1 + (2*mouse.pos.x/scene.canvas.width);
      var y =  1 - (2*mouse.pos.y/scene.canvas.height);
      var ray_clip = [x , y,-1, 1];

      var ray_eye = mult(inverse(scene.projectionMatrix), ray_clip,4);
      ray_eye[2] = -1;
      ray_eye[3] =  0;

      var ray_world = mult(scene.viewMatrix, ray_eye,4);
      ray_world[3]  = 0;

      norms = 0;
      for( var i=0; i<ray_world.length - 1; i++) norms += ray_world[i]*ray_world[i];
      norms = Math.sqrt(norms);
      for( var i=0; i<ray_world.length - 1; i++) ray_world[i] /= norms;

        var b = scene.camera.x*ray_world[0] + scene.camera.y*ray_world[1] + scene.camera.z*ray_world[2] -
                obj.position.x*ray_world[0] - obj.position.y*ray_world[1] - obj.position.z*ray_world[2];

        var c = ray_world[0]*ray_world[0] + ray_world[1]*ray_world[1] + ray_world[2]*ray_world[2];

        var t = -b/c;

        obj.position.x = (scene.camera.x + t*ray_world[0]);
        obj.position.y = (scene.camera.y + t*ray_world[1]);
        obj.position.z = (scene.camera.z + t*ray_world[2]);
        obj.updateModel();

    }else if(mouse.hold === true){

        var cos = 0.9999;
        var sin = 0.0141417820659208293429514137163717;
        var rot = [];

        var ux = null;
        var uy = null;
        var uz = null;
        var vx = null;
        var vy = null;
        var vz = null;
        var wx = null;
        var wy = null;
        var wz = null;

        var dx = mouse.pos.x - mouse.pos.x0;
        var dy = mouse.pos.y - mouse.pos.y0;

        if(dx<0) dx = -dx;
        if(dy<0) dy = -dy;

        var ang = Math.atan(dy/dx)*180/Math.PI;

        if(dx === 0) ang = 90;

        if(scene.up.x < 0) ux = -scene.up.x;
        else ux = scene.up.x
        if(scene.up.y < 0) uy = -scene.up.y;
        else uy = scene.up.y
        if(scene.up.z < 0) uz = -scene.up.z;
        else uz = scene.up.z

        if(scene.xaxis.x < 0) vx = -scene.xaxis.x;
        else vx = scene.xaxis.x
        if(scene.xaxis.y < 0) vy = -scene.xaxis.y;
        else vy = scene.xaxis.y
        if(scene.xaxis.z < 0) vz = -scene.xaxis.z;
        else vz = scene.xaxis.z

        if(scene.zaxis.x < 0) wx = -scene.zaxis.x;
        else wx = scene.zaxis.x
        if(scene.zaxis.y < 0) wy = -scene.zaxis.y;
        else wy = scene.zaxis.y
        if(scene.zaxis.z < 0) wz = -scene.zaxis.z;
        else wz = scene.zaxis.z

        if(ang < 20){

          // ROTATE Z
          if(uz >= ux && uz >= uy){

            if(scene.up.z < 0) sin = -sin;

            if(mouse.pos.x > mouse.pos.x0){
              rot = [  cos, sin, 0, 0,
                      -sin, cos, 0, 0,
                       0  , 0  , 1, 0,
                       0  , 0  , 0, 1 ];
            }else{
              rot = [  cos, -sin, 0, 0,
                       sin,  cos, 0, 0,
                       0  ,  0  , 1, 0,
                       0  ,  0  , 0, 1 ];
            }

          // ROTATE Y
          }else if(uy >= ux && uy >= uz){

            if(scene.up.y < 0) sin = -sin;

            if(mouse.pos.x > mouse.pos.x0){
                rot = [  cos, 0, -sin, 0,
                         0  , 1,  0  , 0,
                         sin, 0,  cos, 0,
                         0  , 0,  0  , 1 ];
            }else{
                rot = [  cos, 0, sin, 0,
                         0  , 1, 0  , 0,
                        -sin, 0, cos, 0,
                         0  , 0, 0  , 1 ];
            }
            // ROTATE X
            }else if(ux > uy && ux > uz){

              if(scene.xaxis.x < 0) sin = -sin;

              if(mouse.pos.y > mouse.pos.y0){
                rot = [  1,  0  , 0  , 0,
                         0,  cos, sin, 0,
                         0, -sin, cos, 0,
                         0,  0  , 0  , 1 ];
              }else{
                rot = [  1, 0  ,  0  , 0,
                         0, cos, -sin, 0,
                         0, sin,  cos, 0,
                         0, 0  ,  0  , 1 ];
              }
            }
        }else if(ang > 60){

          // ROTATE Z
          if(vz > vy && vz > vx){

            if(scene.xaxis.z < 0) sin = -sin;

            if(mouse.pos.y > mouse.pos.y0){
              rot = [  cos, sin, 0, 0,
                      -sin, cos, 0, 0,
                       0  , 0  , 1, 0,
                       0  , 0  , 0, 1 ];
            }else{
              rot = [  cos, -sin, 0, 0,
                       sin,  cos, 0, 0,
                       0  ,  0  , 1, 0,
                       0  ,  0  , 0, 1 ];
            }

          // ROTATE X
          }else if(vx > vy && vx > vz){

            if(scene.xaxis.x < 0) sin = -sin;

            if(mouse.pos.y > mouse.pos.y0){
              rot = [  1,  0  , 0  , 0,
                       0,  cos, sin, 0,
                       0, -sin, cos, 0,
                       0,  0  , 0  , 1 ];
            }else{
              rot = [  1, 0  ,  0  , 0,
                       0, cos, -sin, 0,
                       0, sin,  cos, 0,
                       0, 0  ,  0  , 1 ];
            }
          // ROTATE Y
          }else if(vy >= vx && vy >= vz){

            if(scene.xaxis.y < 0) sin = -sin;

            if(mouse.pos.x > mouse.pos.x0){
                rot = [  cos, 0, -sin, 0,
                         0  , 1,  0  , 0,
                         sin, 0,  cos, 0,
                         0  , 0,  0  , 1 ];
            }else{
                rot = [  cos, 0, sin, 0,
                         0  , 1, 0  , 0,
                        -sin, 0, cos, 0,
                         0  , 0, 0  , 1 ];
            }
          }
        }else{

          sin = sin*0.5;
          if(mouse.pos.x > mouse.pos.x0 && mouse.pos.y0 > mouse.pos.y) sin = -sin;
          else if(mouse.pos.x < mouse.pos.x0 && mouse.pos.y > mouse.pos.y0) sin = -sin;

          // ROTATE Z
          if(wz > wy && wz > wx){

            if(scene.zaxis.z > 0) sin = -sin;

            if(mouse.pos.y > mouse.pos.y0){
              rot = [  cos, sin, 0, 0,
                      -sin, cos, 0, 0,
                       0  , 0  , 1, 0,
                       0  , 0  , 0, 1 ];
            }else{
              rot = [  cos, -sin, 0, 0,
                       sin,  cos, 0, 0,
                       0  ,  0  , 1, 0,
                       0  ,  0  , 0, 1 ];
            }

          // ROTATE X
        }else if(wx > wy && wx > wz){

            if(scene.zaxis.x > 0) sin = -sin;

            if(mouse.pos.y > mouse.pos.y0){
              rot = [  1,  0  , 0  , 0,
                       0,  cos, sin, 0,
                       0, -sin, cos, 0,
                       0,  0  , 0  , 1 ];
            }else{
              rot = [  1, 0  ,  0  , 0,
                       0, cos, -sin, 0,
                       0, sin,  cos, 0,
                       0, 0  ,  0  , 1 ];
            }
          // ROTATE Y
        }else if(wy >= wx && wy >= wz){

            if(scene.zaxis.y > 0) sin = -sin;

            if(mouse.pos.x > mouse.pos.x0){
                rot = [  cos, 0, -sin, 0,
                         0  , 1,  0  , 0,
                         sin, 0,  cos, 0,
                         0  , 0,  0  , 1 ];
            }else{
                rot = [  cos, 0, sin, 0,
                         0  , 1, 0  , 0,
                        -sin, 0, cos, 0,
                         0  , 0, 0  , 1 ];
            }
          }
        }

        scene.viewMatrix = mult(rot, scene.viewMatrix, 4);

        if(mouse.count === 35){
            mouse.count = 0;
            mouse.pos.x0 = mouse.pos.x;
            mouse.pos.y0 = mouse.pos.y;
        }

        updateCamera(scene);
        mouse.count++;
    }
}

// --------------------------------- MOUSE HANDLER --------------------------------------
var mouse =  function(canvas, click, move, release, zoom){
    this.pos = {x: 0, y: 0, x0: 0, y0: 0};
    this.pos2 = {x: 0, y: 0, x0: 0, y0: 0};

    this.scroll = 0;
    this.hold = false;
    this.count = 0;
    canvas.onmousedown = click;
    canvas.onmousemove = move;
    canvas.onmouseup = release;
    canvas.onwheel = zoom;
}
