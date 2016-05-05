var physicsComputingRender = function(world, shaders, data){

    // VARIABLES
    this.gl = world.gl;
    this.size = world.texsize;
    this.world = world;
    this.shaders = shaders;
    this.squareTexBuffer = [];
    this.squareVertexBuffer = [];
    this.textures = [];
    this.texUniforms = [];
    this.data = data;
    this.state = true;

    createsquareTexBuffer(this);

    // ---------------------- SHADER UNIFORMS AND ATTRIBUTES -------------------
    // SHADER 0
    this.S0positionUniform = this.gl.getUniformLocation(this.shaders[0], "position");
    this.S0texsizeUniform = this.gl.getUniformLocation(this.shaders[0], "texsize");
    this.S0vertexTexAttribute = this.gl.getAttribLocation(this.shaders[0], "vTexPixels");
    this.S0vertexPositionAttribute = this.gl.getAttribLocation(this.shaders[0], "vertexPos");
    // SHADER 1
    this.S1vertexTexAttribute = this.gl.getAttribLocation(this.shaders[1], "vTexPixels");
    this.S1vertexPositionAttribute = this.gl.getAttribLocation(this.shaders[1], "vertexPos");
    this.S1distanceUniform = this.gl.getUniformLocation(this.shaders[1], "distance");
    this.S1velocityUniform = this.gl.getUniformLocation(this.shaders[1], "velocity");
    this.S1positionUniform = this.gl.getUniformLocation(this.shaders[1], "position");
    this.S1texsizeUniform = this.gl.getUniformLocation(this.shaders[1], "texsize");
    this.S1frictionUniform = this.gl.getUniformLocation(this.shaders[1], "friction");
    this.S1wallSpringUniform = this.gl.getUniformLocation(this.shaders[1], "wallspring");
    this.S1radiusUniform = this.gl.getUniformLocation(this.shaders[1], "radius");
    this.S1worldsizeUniform = this.gl.getUniformLocation(this.shaders[1], "worldsize");
    this.S1naparticlesUniform = this.gl.getUniformLocation(this.shaders[1], "nparticles");
    // SHADER 2
    this.S2vertexTexAttribute = this.gl.getAttribLocation(this.shaders[2], "vTexPixels");
    this.S2vertexPositionAttribute = this.gl.getAttribLocation(this.shaders[2], "vertexPos");
    this.S2velocityUniform = this.gl.getUniformLocation(this.shaders[2], "velocity");
    this.S2forceUniform = this.gl.getUniformLocation(this.shaders[2], "force");
    this.S2positionUniform = this.gl.getUniformLocation(this.shaders[2], "position");
    this.S2massUniform = this.gl.getUniformLocation(this.shaders[2], "mass");
    this.S2dtUniform = this.gl.getUniformLocation(this.shaders[2], "dt");
    this.S2gravityUniform = this.gl.getUniformLocation(this.shaders[2], "gravity");
    this.S2maxvelocityUniform = this.gl.getUniformLocation(this.shaders[2], "maxvelocity");
    // SHADER 3
    this.S3vertexTexAttribute = this.gl.getAttribLocation(this.shaders[3], "vTexPixels");
    this.S3vertexPositionAttribute = this.gl.getAttribLocation(this.shaders[3], "vertexPos");
    this.S3velocityUniform = this.gl.getUniformLocation(this.shaders[3], "velocity");
    this.S3positionUniform = this.gl.getUniformLocation(this.shaders[3], "position");
    this.S3dtUniform = this.gl.getUniformLocation(this.shaders[3], "dt");

    // ------------------------------ DATA TEXTURES ----------------------------
    this.position = createDataTexture(this.gl, this.size.x, this.size.y, this.data.position, 4);
    this.position_ = createDataTexture(this.gl, this.size.x, this.size.y, this.data.position, 4);
    this.velocity = createDataTexture(this.gl, this.size.x, this.size.y, this.data.velocity, 4);
    this.velocity_ = createDataTexture(this.gl, this.size.x, this.size.y, this.data.velocity, 4);
    this.distance = createDataTexture(this.gl, this.size.x, this.size.y, this.data.distance, 4);
    this.force = createDataTexture(this.gl, this.size.x, this.size.y, this.data.force, 4);
    this.mass = createDataTexture(this.gl, this.size.x, this.size.y, this.data.mass, 1);
    this.radius = createDataTexture(this.gl, this.size.x, this.size.y, this.data.radius, 1);

    // --------------------------- FRAME BUFFERS -------------------------------
    this.FBdistance = createTextureFrameBuffer(this.gl, this.size.x, this.size.y, this.distance);
    this.FBforce = createTextureFrameBuffer(this.gl, this.size.x, this.size.y, this.force);
    this.FBvelocity = createTextureFrameBuffer(this.gl, this.size.x, this.size.y, this.velocity);
    this.FBposition = createTextureFrameBuffer(this.gl, this.size.x, this.size.y, this.position);

    this.compute1 =  function() {

        if(this.state === true){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBvelocity);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.velocity_, 0);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBposition);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.position_, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.position); // 0
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.distance); // 1
            this.gl.activeTexture(this.gl.TEXTURE2);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.force);    // 2
            this.gl.activeTexture(this.gl.TEXTURE3);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mass);     // 3
            this.gl.activeTexture(this.gl.TEXTURE4);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.radius);   // 4
            this.gl.activeTexture(this.gl.TEXTURE5);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocity); // 5
        }else {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBvelocity);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.velocity, 0);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBposition);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.position, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.position_); // 0
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.distance); // 1
            this.gl.activeTexture(this.gl.TEXTURE2);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.force);    // 2
            this.gl.activeTexture(this.gl.TEXTURE3);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.mass);     // 3
            this.gl.activeTexture(this.gl.TEXTURE4);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.radius);   // 4
            this.gl.activeTexture(this.gl.TEXTURE5);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocity_); // 5
        }

        this.gl.viewport(0, 0, this.size.x, this.size.y);

        // ######## RENDER S0
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBdistance);
        this.gl.useProgram(this.shaders[0]);
        // BUFFERS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexBuffer);
        this.gl.vertexAttribPointer(this.S0vertexTexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S0vertexTexAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.S0vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S0vertexPositionAttribute);
        // UNIFORMS
        this.gl.uniform2fv(this.S0texsizeUniform, [this.size.x, this.size.y]);
        this.gl.uniform1i(this.S0positionUniform, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // ######## RENDER S1
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBforce);
        this.gl.useProgram(this.shaders[1]);
        // BUFFERS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexBuffer);
        this.gl.vertexAttribPointer(this.S1vertexTexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S1vertexTexAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.S1vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S1vertexPositionAttribute);
        // UNIFORMS
        this.gl.uniform1i(this.S1distanceUniform, 1);
        this.gl.uniform1i(this.S1velocityUniform, 5);
        this.gl.uniform1i(this.S1radiusUniform, 4);
        this.gl.uniform1i(this.S1positionUniform, 0);
        this.gl.uniform2fv(this.S1texsizeUniform, [this.size.x, this.size.y]);
        this.gl.uniform1f(this.S1frictionUniform, this.world.friction);
        this.gl.uniform1f(this.S1wallSpringUniform, this.world.wallSpring);
        this.gl.uniform1f(this.S1naparticlesUniform, this.world.id);
        this.gl.uniform3fv(this.S1worldsizeUniform, [this.world.size.x, this.world.size.y, this.world.size.z]);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // ######### RENDER S2
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBvelocity);
        this.gl.useProgram(this.shaders[2]);
        // BUFFERS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexBuffer);
        this.gl.vertexAttribPointer(this.S2vertexTexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S2vertexTexAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.S2vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S2vertexPositionAttribute);
        // UNIFORMS
        this.gl.uniform1i(this.S2velocityUniform, 5);
        this.gl.uniform1i(this.S2forceUniform, 2);
        this.gl.uniform1i(this.S2positionUniform, 0);
        this.gl.uniform1i(this.S2massUniform, 3);
        this.gl.uniform1f(this.S2dtUniform, this.world.dt);
        this.gl.uniform1f(this.S2gravityUniform, this.world.gravity);
        this.gl.uniform1f(this.S2maxvelocityUniform, this.world.maxvelocity);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        // ######## RENDER S3
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.FBposition);
        this.gl.useProgram(this.shaders[3]);
        // BUFFERS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareTexBuffer);
        this.gl.vertexAttribPointer(this.S3vertexTexAttribute, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S3vertexTexAttribute);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVertexBuffer);
        this.gl.vertexAttribPointer(this.S3vertexPositionAttribute, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.S3vertexPositionAttribute);
        // UNIFORMS
        this.gl.uniform1i(this.S3positionUniform, 0);
        this.gl.uniform1i(this.S3velocityUniform, 5);
        this.gl.uniform1f(this.S3dtUniform, this.world.dt);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.state = !this.state;
    }
}
