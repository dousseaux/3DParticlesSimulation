var scene = function(gl, canvas){

    this.gl = gl;
    this.canvas = canvas;

    // GRAPHICS MATRICES
    this.projectionMatrix = [];
    this.viewMatrix = [];

    // SET PROJECTION MODE
    this.projectionMode = 1;
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

    // LIGHT PARAMETERS
    this.light = [4, -3, -5];
    this.lightmode = 0.0;

    // UPDATE CAMERA
    var thisScene = this;
    this.updateCamera = function(){viewMatrix(thisScene)};
    this.updateProjection = function(){projectionMatrix(thisScene)};

    // INTIALIZE PROJECTION MATRIX
    projectionMatrix(this);
    // INTIALIZE VIEW MATRIX
    viewMatrix(this);

    // ENABLE DEPTH
    this.gl.enable(this.gl.DEPTH_TEST);
    //this.gl.enable(this.gl.BLEND);
    //this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.selected = null;

    this.squareNormalBuffer = [];
    this.squareVertexBuffer = [];
    this.lineNormalBuffer = [];
    this.lineVertexBuffer = [];

    this.spheres = [];

    // SHADERS
    this.shaderPrograms = [];

    createsquareBuffer(this);
    createlineBuffer(this);

    var self = this;

    this.draw = function(){
        initViewport(gl, self.canvas);
        self.gl.bindFramebuffer(self.gl.FRAMEBUFFER, null);
        self.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        self.gl.clearColor(0.05, 0.05, 0.1, 1.0);
        self.spheres.draw();
    }
}

// -------------------------------------- SPHERE OBJECT----------------------------------
var spheres = function(scene, data, shader, translationTex, scaleTex, texsize){

    // VARIABLES
    this.gl = scene.gl;
    this.shader = shader;
    this.scene = scene;

    // SPHERE PARAMETERS
    this.shininess = 15;
    this.sphereLongitude = 10;
    this.sphereLatitude = 10;
    this.sphereVertexSize = this.sphereLatitude*this.sphereLongitude*6;

    this.idsBuffer = new ArrayBuffer(this.sphereVertexSize*texsize.x*texsize.y*32);
    this.normals = [];
    this.vertex = []
    this.data = data;
    this.ids = [];
    this.items = 0;
    this.items_p_render = 5000;

    // BUFFERS
    this.drawerBuffers = [];
    this.drawerArrays = [];

    var self = this;
    function createArrays(){

        var vertex = [];
        var normals = [];
        var vtemp = [];
        var ntemp = [];
        var ttemp = [];

        latitudeBands = self.sphereLatitude;
        longitudeBands = self.sphereLongitude;

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

        self.normals = new Float32Array(self.sphereVertexSize*3);
        self.vertex = new Float32Array(self.sphereVertexSize*4);
        self.normals.set(normals);
        self.vertex.set(vertex);
    }
    createArrays();

    // TEXTURES
    this.texsize = texsize;
    this.translationTex = translationTex;
    this.scaleTex = scaleTex;
    this.colorTex = createDataTexture(this.gl, this.texsize.x, this.texsize.y, this.colors, 4);
    this.vertexTex = createDataTexture(this.gl, this.sphereVertexSize, 1.0, this.vertex, 4);
    this.normalsTex = createDataTexture(this.gl, this.sphereVertexSize, 1.0, this.normals, 3);

    // SET SHADER ATTRIBUTES POINTERS
    this.sphereIdAttribute = this.gl.getAttribLocation(this.shader, "id");

    // SET SHADER UNIFORMS POINTERS
    this.vertexNormalUniform = this.gl.getUniformLocation(this.shader, "vNormal");
    this.vertexPositionUniform = this.gl.getUniformLocation(this.shader, "vertexPos")
    this.translationUniform = this.gl.getUniformLocation(this.shader, "translationTex");
    this.scaleUniform = this.gl.getUniformLocation(this.shader, "scaleTex");
    this.colorUniform = this.gl.getUniformLocation(this.shader, "colorTex");
    this.projectionMatrixUniform = this.gl.getUniformLocation(this.shader, "projectionMatrix");
    this.viewMatrixUniform = this.gl.getUniformLocation(this.shader, "viewMatrix");
    this.lightUniform = this.gl.getUniformLocation(this.shader, "light");
    this.lightModeUniform = this.gl.getUniformLocation(this.shader, "lightmode");
    this.shininessUniform = this.gl.getUniformLocation(this.shader, "shininess");
    this.sizeUniform = this.gl.getUniformLocation(this.shader, "size");
    this.vTexSizeUniform = this.gl.getUniformLocation(this.shader, "vTexsize");

    function updateBuffers(){

        self.drawerBuffers = [];
        self.drawerArrays = [];
        var n = parseInt(self.items / self.items_p_render);

        if(n>0){
            self.drawerArrays.push(new Float32Array(self.idsBuffer, 0, 2*self.items_p_render*self.sphereVertexSize));
            self.drawerBuffers.push(self.scene.gl.createBuffer());
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[0]);
            self.gl.bufferData(self.gl.ARRAY_BUFFER, self.drawerArrays[0], scene.gl.STATIC_DRAW);
            for(var i=1; i<n; i++){
                self.drawerArrays.push(new Float32Array(self.idsBuffer, 8*i*self.sphereVertexSize*self.items_p_render, 2*self.items_p_render*self.sphereVertexSize));
                self.drawerBuffers.push(self.scene.gl.createBuffer());
                self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[i]);
                self.gl.bufferData(self.gl.ARRAY_BUFFER, self.drawerArrays[i], scene.gl.STATIC_DRAW);
            }
            self.drawerArrays.push(new Float32Array(self.idsBuffer, 8*n*self.sphereVertexSize*self.items_p_render, 2*(self.items - n*self.items_p_render)*self.sphereVertexSize));
            self.drawerBuffers.push(self.scene.gl.createBuffer());
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[n]);
            self.gl.bufferData(self.gl.ARRAY_BUFFER, self.drawerArrays[n], scene.gl.STATIC_DRAW);
        }else{
            self.drawerBuffers.push(self.scene.gl.createBuffer());
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[0]);
            self.gl.bufferData(self.gl.ARRAY_BUFFER, self.ids, scene.gl.STATIC_DRAW);
        }
    }
    this.update = function(){
        self.ids = [];
        var ids = [];
        self.items = self.data.id + 1;
        for(var i=0; i<self.items; i++){
            for(var k=0; k<self.sphereVertexSize; k++){
                ids.push(i);
                ids.push(k);
            }
        }
        self.ids = new Float32Array(self.idsBuffer, 0, self.ids.length+ids.length);
        self.ids.set(ids, self.ids.length-ids.length);
        updateBuffers();
    }
    this.add = function(id, color){
        var ids = [];
        for(var i=0; i<self.sphereVertexSize; i++){
            ids.push(id);
            ids.push(i);
        }
        self.ids = new Float32Array(self.idsBuffer, 0, self.ids.length+ids.length);
        self.ids.set(ids, self.ids.length-ids.length);
        self.data.colors.set(color, id*4);

        updateTexture4d(self.gl, self.texsize, self.colorTex, self.data.colors);
        self.items++;
        updateBuffers();
    }
    this.fastAdd = function(id, color){
        var ids = [];
        for(var i=0; i<self.sphereVertexSize; i++){
            ids.push(id);
            ids.push(i);
        }
        self.ids.set(ids, 2*self.sphereVertexSize*self.items);
        self.data.colors.set(color, id*4);
        self.items++;
    }
    this.prepareFastAdd = function(){
        self.ids = new Float32Array(self.idsBuffer);
    }
    this.finishFastAdd = function(){
        self.ids = new Float32Array(self.idsBuffer, 0, 2*this.sphereVertexSize*self.items);
        updateTexture4d(self.gl, self.texsize, self.colorTex, self.data.colors);
        updateBuffers();
    }
    this.draw =  function() {

        // SET SHADER
        self.gl.useProgram(self.shader);

        // ACTIVE/BIND TEXTURES
        self.gl.activeTexture(self.gl.TEXTURE0);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.translationTex);
        self.gl.activeTexture(self.gl.TEXTURE1);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.scaleTex);
        self.gl.activeTexture(self.gl.TEXTURE2);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.colorTex);
        self.gl.activeTexture(self.gl.TEXTURE3);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.vertexTex);
        self.gl.activeTexture(self.gl.TEXTURE4);
        self.gl.bindTexture(self.gl.TEXTURE_2D, self.normalsTex);

        // LINK SHADER UNIFORMS WITH OBJECT VARIABLES
        self.gl.uniformMatrix4fv(self.viewMatrixUniform, false, scene.viewMatrix);                  // VIW MATRIX
        self.gl.uniformMatrix4fv(self.projectionMatrixUniform, false, self.scene.projectionMatrix); // PROJECTION
        self.gl.uniform3fv(self.lightUniform, self.scene.light);                                    // LIGHT
        self.gl.uniform2fv(self.sizeUniform, [self.texsize.x, texsize.y]);                          // TEX SIZE
        self.gl.uniform1f(self.vTexSizeUniform, self.sphereVertexSize);                             // NUM O VERTEX
        self.gl.uniform1f(self.lightModeUniform, self.scene.lightmode);                             // LIGHT MODE
        self.gl.uniform1f(self.shininessUniform, self.shininess);                                   // SHININESS
        self.gl.uniform1i(self.translationUniform, 0);                                              // TRANSLATION TEXTURE
        self.gl.uniform1i(self.scaleUniform, 1);                                                    // SCALE TEXTURE
        self.gl.uniform1i(self.colorUniform, 2);                                                    // COLOR
        self.gl.uniform1i(self.vertexPositionUniform, 3);                                           // VERTEX POSITION
        self.gl.uniform1i(self.vertexNormalUniform, 4);                                             // NORMALS

        self.gl.enableVertexAttribArray(self.sphereIdAttribute);

        var n = parseInt(self.items / self.items_p_render);

        if(n>0){

            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[0]);
            self.gl.vertexAttribPointer(self.sphereIdAttribute, 2, self.gl.FLOAT, false, 0, 0);
            self.gl.drawArrays(self.gl.TRIANGLES, 0, self.items_p_render*self.sphereVertexSize);

            for(var i=1; i<n; i++){
                self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[i]);
                self.gl.vertexAttribPointer(self.sphereIdAttribute, 2, self.gl.FLOAT, false, 0, 0);
                self.gl.drawArrays(self.gl.TRIANGLES, 0, self.items_p_render*self.sphereVertexSize);
            }

            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[n]);
            self.gl.vertexAttribPointer(self.sphereIdAttribute, 2, self.gl.FLOAT, false, 0, 0);
            self.gl.drawArrays(self.gl.TRIANGLES, 0, (self.items - n*self.items_p_render)*self.sphereVertexSize);

        }else{
            self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawerBuffers[0]);
            self.gl.vertexAttribPointer(self.sphereIdAttribute, 2, self.gl.FLOAT, false, 0, 0);
            self.gl.drawArrays(self.gl.TRIANGLES, 0, self.items*self.sphereVertexSize);
        }
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
var particle = function(world, id, color, fast){
    this.world = world;
    this.id = id;
    this.color = color;
    this.position = {x:1, y:1, z:1};
    this.radius = 4;
    this.mass = this.radius*this.radius*this.radius;
    this.velocity = {x:0, y:0, z:0};
    this.force = {x:0, y:0, z:0};
    if(fast) this.world.scene.spheres.fastAdd(this.id, this.color);
    else this.world.scene.spheres.add(this.id, this.color);
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

        if(d <= obj[i].radius*obj[i].radius  && t<tp){
            scene.selected = obj[i].id;
            tp = t;
        }
    }
}

// ------------------------- CAMERA MOVING AND AND OBJ MOVING ---------------------------
function mouseMoving(mouse, world, obj){

    if(mouse.selected !== null && mouse.hold === true){

        var norms;
        var x = -1 + (2*mouse.pos.x/world.scene.canvas.width);
        var y =  1 - (2*mouse.pos.y/world.scene.canvas.height);
        var ray_clip = [x , y,-1, 1];

        var ray_eye = mult(inverse(world.scene.projectionMatrix), ray_clip,4);
        ray_eye[2] = -1;
        ray_eye[3] =  0;

        var ray_world = mult(world.scene.viewMatrix, ray_eye,4);
        ray_world[3]  = 0;

        norms = 0;
        for( var i=0; i<ray_world.length - 1; i++) norms += ray_world[i]*ray_world[i];
        norms = Math.sqrt(norms);
        for( var i=0; i<ray_world.length - 1; i++) ray_world[i] /= norms;

        world.updateBodies();

        var b = world.scene.camera.x*ray_world[0] + world.scene.camera.y*ray_world[1] + world.scene.camera.z*ray_world[2] -
                obj.position.x*ray_world[0] - obj.position.y*ray_world[1] - obj.position.z*ray_world[2];

        var c = ray_world[0]*ray_world[0] + ray_world[1]*ray_world[1] + ray_world[2]*ray_world[2];

        var t = -b/c;
        world.data.position[4*i] = (world.scene.camera.x + t*ray_world[0]);
        world.data.position[4*i + 1] = (world.scene.camera.y + t*ray_world[1]);
        world.data.position[4*i + 2] = (world.scene.camera.z + t*ray_world[2]);
        if(world.gpucomp.state)updateTexture4d(world.gpucomp.gl, world.texsize, world.gpucomp.position, world.data.position);
        else updateTexture4d(world.gpucomp.gl, world.texsize, world.gpucomp.position_, world.data.position);
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

        if(world.scene.up.x < 0) ux = -world.scene.up.x;
        else ux = world.scene.up.x
        if(world.scene.up.y < 0) uy = -world.scene.up.y;
        else uy = world.scene.up.y
        if(world.scene.up.z < 0) uz = -world.scene.up.z;
        else uz = world.scene.up.z

        if(world.scene.xaxis.x < 0) vx = -world.scene.xaxis.x;
        else vx = world.scene.xaxis.x
        if(world.scene.xaxis.y < 0) vy = -world.scene.xaxis.y;
        else vy = world.scene.xaxis.y
        if(world.scene.xaxis.z < 0) vz = -world.scene.xaxis.z;
        else vz = world.scene.xaxis.z

        if(world.scene.zaxis.x < 0) wx = -world.scene.zaxis.x;
        else wx = world.scene.zaxis.x
        if(world.scene.zaxis.y < 0) wy = -world.scene.zaxis.y;
        else wy = world.scene.zaxis.y
        if(world.scene.zaxis.z < 0) wz = -world.scene.zaxis.z;
        else wz = world.scene.zaxis.z

        if(ang < 20){

          // ROTATE Z
          if(uz >= ux && uz >= uy){

            if(world.scene.up.z < 0) sin = -sin;

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

            if(world.scene.up.y < 0) sin = -sin;

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

              if(world.scene.xaxis.x < 0) sin = -sin;

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

            if(world.scene.xaxis.z < 0) sin = -sin;

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

            if(world.scene.xaxis.x < 0) sin = -sin;

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

            if(world.scene.xaxis.y < 0) sin = -sin;

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

            if(world.scene.zaxis.z > 0) sin = -sin;

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

            if(world.scene.zaxis.x > 0) sin = -sin;

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

            if(world.scene.zaxis.y > 0) sin = -sin;

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

        world.scene.viewMatrix = mult(rot, world.scene.viewMatrix, 4);

        if(mouse.count === 35){
            mouse.count = 0;
            mouse.pos.x0 = mouse.pos.x;
            mouse.pos.y0 = mouse.pos.y;
        }

        updateCamera(world.scene);
        mouse.count++;
    }
}
