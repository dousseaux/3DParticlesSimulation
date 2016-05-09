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

// --------------------------- CREATE TEXTURE FRAME BUFFER ------------------------------
function createTextureFrameBuffer(gl, x, y, texture){

    var frameBuffer = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return frameBuffer;
}

// --------------------------------- CREATE TEXTURE -------------------------------------
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

    return texture;
}

// ------------------------------- CREATE DATA TEXTURE ----------------------------------
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

// --------------------------- UPDATE 1D TEXTURE CONTENT --------------------------------
function updateTexture1d(gl, size, texture, data){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, size.x, size.y, 0, gl.ALPHA, gl.FLOAT, data);
}

// --------------------------- UPDATE 2D TEXTURE CONTENT --------------------------------
function updateTexture3d(gl, size, texture, data){
    gl.bindTexture(gl.TEXTURE_2D, texture); // 0
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size.x, size.y, 0, gl.RGB, gl.FLOAT, data);
}

// --------------------------- UPDATE 3D TEXTURE CONTENT --------------------------------
function updateTexture4d(gl, size, texture, data){
    gl.bindTexture(gl.TEXTURE_2D, texture); // 0
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.FLOAT, data);
}

// ---------------------------- GET 3D FRAMEBUFFER DATA ---------------------------------
function getFrameData3d(gl, size, frame, destinationBuffer){
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.readPixels(0, 0, size.x, size.y, gl.RGB, gl.FLOAT, destinationBuffer);
}

// ---------------------------- GET 4D FRAMEBUFFER DATA ---------------------------------
function getFrameData4d(gl, size, frame, destinationBuffer){
    gl.bindFramebuffer(gl.FRAMEBUFFER, frame);
    gl.readPixels(0, 0, size.x, size.y, gl.RGBA, gl.FLOAT, destinationBuffer);
}
