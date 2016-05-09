// ----------------------------- CREATE A VIEW TO -------------------------------------
var view = function(world){

  this.mouse = null;
  this.keys = {LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32,
               A: 65, S:83, D:68, W:87, PAGEUP: 33, PAGEDOWN: 34,
               CTRL: 17, SHIFT: 16, ENTER: 13};
  this.isFull = false;
  this.isPaused = false;
  this.isSpecsFix = false;
  this.renderIntervalID = null;
  this.updateInfoIntervalID = null;

  // ----------------------------- VIEW ELEMENTS -------------------------------
  this.interactCode1 = document.getElementById("interactCode1");
  this.interactCode2 = document.getElementById("interactCode2");
  this.gravityInput = document.getElementById("gravityInput");
  this.frictionInput = document.getElementById("frictionInput");
  this.canvas = document.getElementById("screen");
  this.pause = document.getElementById("pause");
  this.add = document.getElementById("add");
  this.remove = document.getElementById("remove");
  this.restart = document.getElementById("restart");
  this.phys = document.getElementById("phys");
  this.analysis = document.getElementById("analysis");
  this.goFull = document.getElementById("goFull");
  this.specs = document.getElementById("specs");
  this.settings = document.getElementById("settings");
  this.simulationInfo = document.getElementById("simulationInfo");
  this.settingsmenu = document.getElementById("settingsmenu");
  this.side = document.getElementById("side");
  this.menu = document.getElementById("menu");
  this.header = document.getElementById("header");
  this.container = document.getElementById("container");
  this.pinSpecs = document.getElementById("pinSpecs");
  this.pinSimuInfo = document.getElementById("pinSimuInfo");
  this.time = document.getElementById("time");
  this.particles = document.getElementById("particles");
  this.particlesState = document.getElementById("particlesState");
  this.activeWalls = document.getElementById("activeWalls");
  this.activeEdges = document.getElementById("activeEdges");
  if(document.getElementById("saveModel")){
      this.saveModel = document.getElementById("saveModel");
      this.uploadModel = document.getElementById("uploadModel");
      this.downloader = document.getElementById("downloader");
      this.uploader = document.getElementById("uploader");
      this.uploadModel.onclick = function(){self.uploader.click()};
      this.saveModel.onclick = world.saveModel;
      this.uploader.onchange = world.uploadModel;
  }

  var bodystyle = window.getComputedStyle(document.body);
  this.size = {x: parseFloat(bodystyle.width), y: parseFloat(bodystyle.height)};
  var self = this;

  // ---------------------- MOUSE AND TOUCH HANDLERS ---------------------------
  var click = function(event){
    self.mouse.pos.x = event.clientX - world.scene.canvas.offsetLeft;
    self.mouse.pos.y = event.clientY - world.scene.canvas.offsetTop;
    self.mouse.pos.x0 = self.mouse.pos.x;
    self.mouse.pos.y0 = self.mouse.pos.y
    world.scene.selected = null;
    if(world.updateBodies)world.updateBodies();
    self.mouse.hold = true;
    mousePicking(self.mouse, world.scene, world.bodies);
    self.mouse.selected = world.scene.selected;
  }
  var move = function(event){
    self.mouse.pos.x = event.clientX - world.scene.canvas.offsetLeft;
    self.mouse.pos.y = event.clientY - world.scene.canvas.offsetTop;
    mouseMoving(self.mouse, world, world.bodies[self.mouse.selected]);
  }
  var Tmove = function(event){

    self.mouse.pos.x = event.touches[0].clientX - world.scene.canvas.offsetLeft;
    self.mouse.pos.y = event.touches[0].clientY - world.scene.canvas.offsetTop;

    if(event.touches[1] === undefined){
      mouseMoving(self.mouse, world.scene, world.bodies[self.mouse.selected]);
    }else{

      self.mouse.pos2.x = event.touches[1].clientX - world.scene.canvas.offsetLeft;
      self.mouse.pos2.y = event.touches[1].clientY - world.scene.canvas.offsetTop;
      var d0 = (self.mouse.pos.x0-self.mouse.pos2.x0)*(self.mouse.pos.x0-self.mouse.pos2.x0) + (self.mouse.pos.y0-self.mouse.pos2.y0)*(self.mouse.pos.y0-self.mouse.pos2.y0);
      var d = (self.mouse.pos.x-self.mouse.pos2.x)*(self.mouse.pos.x-self.mouse.pos2.x) + (self.mouse.pos.y-self.mouse.pos2.y)*(self.mouse.pos.y-self.mouse.pos2.y);

      world.scene.viewMatrix = inverse(world.scene.viewMatrix);
      if(d < d0){
        world.scene.viewMatrix[12] *= 1.015;
        world.scene.viewMatrix[13] *= 1.015;
        world.scene.viewMatrix[14] *= 1.015;
      }else {
        world.scene.viewMatrix[12] *= 0.985;
        world.scene.viewMatrix[13] *= 0.985;
        world.scene.viewMatrix[14] *= 0.985;
      }
      world.scene.viewMatrix = inverse(world.scene.viewMatrix);
    }

    self.mouse.pos.x0 = self.mouse.pos.x;
    self.mouse.pos.y0 = self.mouse.pos.y;
    self.mouse.pos2.x0 = self.mouse.pos2.x;
    self.mouse.pos2.y0 = self.mouse.pos2.y;

  }
  var release = function(event){
    self.mouse.selected = null;
    self.mouse.hold = false;
  }
  var zoom = function(event){
      world.scene.viewMatrix = inverse(world.scene.viewMatrix);
      if(event.deltaY > 0){
        world.scene.viewMatrix[12] *= 1.05;
        world.scene.viewMatrix[13] *= 1.05;
        world.scene.viewMatrix[14] *= 1.05;
      }else {
        world.scene.viewMatrix[12] *= 0.95;
        world.scene.viewMatrix[13] *= 0.95;
        world.scene.viewMatrix[14] *= 0.95;
      }
      world.scene.viewMatrix = inverse(world.scene.viewMatrix);
  }
  this.mouse = new mouse(this.canvas, click, move, release, zoom);
  this.mouse = new mouse(this.simulationInfo, click, move, release, zoom);
  this.canvas.addEventListener("touchstart", click, false);
  this.canvas.addEventListener("touchend", release, false);
  this.canvas.addEventListener("touchmove", Tmove, false);
  this.simulationInfo.addEventListener("touchstart", click, false);
  this.simulationInfo.addEventListener("touchend", release, false);
  this.simulationInfo.addEventListener("touchmove", Tmove, false);

  // ------------------------- KEY PRESS HANDLERS ------------------------------
  this.frictionInput.onkeypress = function(e){
      if(e.keyCode === self.keys.ENTER) if(!isNaN(self.frictionInput.value)) world.friction = parseFloat(self.frictionInput.value);
  }
  this.gravityInput.onkeypress = function(e){
      if(e.keyCode === self.keys.ENTER) if(!isNaN(self.gravityInput.value)) world.gravity = parseFloat(self.gravityInput.value);
  }

  // --------------------------- CLICK HANDLERS --------------------------------
  this.goFull.onclick = function(){
      var element = document.getElementById("container");
      if(self.isFull === false){
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }

      }else{
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
      }
  }
  this.add.onclick = function(){
    if(world.addMultBody){
        var n = parseInt(prompt("Number of particles: ", "1"))
        world.addMultBody(n);
    }
    else{
        world.addBody();
        world.update();
    }
  }
  this.remove.onclick = function(){
    for(i=0; i<world.bodies.length; i++){
      if(world.selected[i]){
        for(r=i+1; r<world.bodies.length; r++) world.bodies[r].id--;
        world.removeBody(world.bodies[i]);
        world.selected[i] = 0;
        world.selected.splice(i, 1);
        world.id--;
        i--;
      }
    }
  }
  this.restart.onclick = function(){ world.setup();}
  this.pause.onclick = function(){
    if(world.animationID == null){
      self.isPaused = false;
      self.pause.src = "../imgs/pause2.png";
      world.simulate();
      //self.startRender();
    }else{
      self.isPaused = true;
      clearInterval(world.timeIntervalID);
      cancelAnimationFrame(world.animationID);
      self.pause.src = "../imgs/play2.png";
      world.animationID = null;
      //self.stopRender();
    }
  }
  this.pinSpecs.onclick = function(){
    self.isSpecsFix = !self.isSpecsFix;
    if(self.isSpecsFix){
      self.pinSpecs.src = "../imgs/close.png";
      self.pinSpecs.height = 16;
      self.pinSpecs.width = 16;
      self.pinSpecs.style.marginRight = 14;
      self.pinSpecs.style.marginTop = 19;
      self.specs.style.backgroundColor = "#222222";
      self.specs.style.borderLeft = "4px solid #42157c";
    }else{
      self.pinSpecs.src = "../imgs/pin.png";
      self.pinSpecs.height = 24;
      self.pinSpecs.width = 24;
      self.pinSpecs.style.marginRight = 10;
      self.pinSpecs.style.marginTop = 15;
      self.specs.style.backgroundColor = "rgba(40,40,40,0.7)"
      specs.style.display = "none";
      self.specs.style.borderLeft = "none";
    }

    self.resize();
  }
  this.pinSimuInfo.onclick = function(){

    self.isSimuInfoFix = !self.isSimuInfoFix;

    if(self.isSimuInfoFix){
      self.pinSimuInfo.src = "../imgs/close.png";
      self.pinSimuInfo.height = 16;
      self.pinSimuInfo.width = 16;
      self.pinSimuInfo.style.marginRight = 14;
      self.pinSimuInfo.style.marginTop = 19;
      self.simulationInfo.style.backgroundColor = "transparent";
    }else{
      self.pinSimuInfo.src = "../imgs/pin.png";
      self.pinSimuInfo.height = 24;
      self.pinSimuInfo.width = 24;
      self.pinSimuInfo.style.marginRight = 10;
      self.pinSimuInfo.style.marginTop = 15;
      self.simulationInfo.style.backgroundColor = "rgba(40,40,40,0.4)";
      self.simulationInfo.style.display = "none";
    }
  }
  this.activeWalls.onclick = function(){
      if(world.walls.length === 0){
        addWalls(world);
        self.activeWalls.innerHTML = "Deactive Walls"
      }else {
        self.activeWalls.innerHTML = "Active Walls"
        world.walls = [];
      }
  }
  this.activeEdges.onclick = function(){
      if(world.edges.length === 0){
        addEdges(world);
        self.activeEdges.innerHTML = "Deactive Edges"
      }else {
        self.activeEdges.innerHTML = "Active Edges"
        world.edges = [];
      }
  }

  // ---------------------- MOUSE OVER AND OUT HANDLERS ------------------------
  this.pause.onmouseover = function() {
    if(self.isPaused) self.pause.src = "../imgs/play2.png";
    else self.pause.src = "../imgs/pause2.png";
  }
  this.pause.onmouseout = function() {
    if(self.isPaused) self.pause.src = "../imgs/play.png";
    else self.pause.src = "../imgs/pause.png";
  }
  this.add.onmouseover = function() {
    self.add.src = "../imgs/add2.png";
  }
  this.add.onmouseout = function() {
    self.add.src = "../imgs/add.png";
  }
  this.remove.onmouseover = function() {
    self.remove.src = "../imgs/remove2.png";
  }
  this.remove.onmouseout = function() {
    self.remove.src = "../imgs/remove.png";
  }
  this.restart.onmouseover = function() {
   self.restart.src = "../imgs/restart2.png";
   self.phys.src = "../imgs/physics.png";
   if(!self.isSpecsFix) specs.style.display = "none";
  }
  this.restart.onmouseout = function() {
    self.restart.src = "../imgs/restart.png";
  }
  this.phys.onmouseover = function() {
    self.analysis.src = "../imgs/analysis.png";
    self.phys.src = "../imgs/physics2.png";
    specs.style.display = "block";
    if(!self.isSimuInfoFix) simulationInfo.style.display = "none";
  }
  this.analysis.onmouseover = function() {
    self.settings.src = "../imgs/settings.png";
    self.phys.src = "../imgs/physics.png";
    self.analysis.src = "../imgs/analysis2.png";
    if(!self.isSpecsFix) specs.style.display = "none";
    settingsmenu.style.display = "none";
    simulationInfo.style.display = "block";
  }
  this.settings.onmouseover = function() {
    self.settings.src = "../imgs/settings2.png";
    self.analysis.src = "../imgs/analysis.png";
    if(!self.isSimuInfoFix) simulationInfo.style.display = "none";
    settingsmenu.style.display = "block";
  }
  this.goFull.onmouseover = function() {
   self.settings.src = "../imgs/settings.png";
   settingsmenu.style.display = "none";
   if(!self.isFull) self.goFull.src = "../imgs/fullS2.png";
   else self.goFull.src = "../imgs/minimize2.png";
  }
  this.goFull.onmouseout = function() {
    if(!self.isFull) self.goFull.src = "../imgs/fullS.png";
    else self.goFull.src = "../imgs/minimize.png";
  }
  this.side.onmouseover = function() {
    self.settings.src = "../imgs/settings.png";
    self.phys.src = "../imgs/physics.png";
    self.analysis.src = "../imgs/analysis.png";
    if(!self.isSpecsFix) specs.style.display = "none";
    if(!self.isSimuInfoFix) simulationInfo.style.display = "none";
    settingsmenu.style.display = "none";
  }
  this.canvas.onmouseover = function() {
    self.settings.src = "../imgs/settings.png";
    self.phys.src = "../imgs/physics.png";
    self.analysis.src = "../imgs/analysis.png";
    if(!self.isSpecsFix) specs.style.display = "none";
    settingsmenu.style.display = "none";
  }
  this.simulationInfo.onmouseover = function() {
    self.settings.src = "../imgs/settings.png";
    self.phys.src = "../imgs/physics.png";
    self.analysis.src = "../imgs/analysis.png";
    if(!self.isSpecsFix) specs.style.display = "none";
    settingsmenu.style.display = "none";
  }

  // --------------------------- RESIZE ELMENTS --------------------------------
  this.resize = function(){

    var containerstyle = window.getComputedStyle(self.container);
    var menustyle = window.getComputedStyle(self.menu);
    var headerstyle = window.getComputedStyle(self.header);

    if(self.isFull){
      self.container.style.width = window.screen.availWidth - 4;
      self.container.style.height = window.screen.availHeight - 8;
    }else{
      self.container.style.width = self.size.x - parseInt(containerstyle.marginLeft) - parseInt(containerstyle.marginRight) - 4;
      self.header.style.width = self.size.x - parseInt(headerstyle.marginLeft) - parseInt(headerstyle.marginRight);
      self.container.style.height = self.size.y - parseInt(containerstyle.marginTop) - parseInt(containerstyle.marginBottom)
                                    - parseInt(headerstyle.height) - parseInt(headerstyle.marginTop) - parseInt(headerstyle.marginBottom) - 8;
    }

    self.canvas.height = parseInt(self.container.style.height);
    self.canvas.width = parseInt(self.container.style.width) - parseInt(menustyle.width) - 8;
    self.menu.style.height = self.canvas.height;
    self.side.style.height = self.canvas.height;
    self.menu.style.marginLeft = 0;

    self.simulationInfo.style.width = self.canvas.width;
    self.simulationInfo.style.height = self.canvas.height;
    self.simulationInfo.style.marginLeft = -self.canvas.width - 4;
    self.specs.style.height = self.canvas.height;
    self.specs.style.marginLeft = -304;
    self.settingsmenu.style.height = self.canvas.height;
    self.settingsmenu.style.marginLeft = -304;

    if(self.isSpecsFix){
        self.specs.style.marginLeft = -308;
        var specsstyle = window.getComputedStyle(self.specs);
        self.menu.style.marginLeft = parseInt(specsstyle.width) + 4;
        self.canvas.width -= parseInt(specsstyle.width) + 4;
        self.simulationInfo.style.width = self.canvas.width;
        self.simulationInfo.style.marginLeft = -self.canvas.width - parseInt(specsstyle.width) - 8;
    }

    world.scene.aspect = self.canvas.width / self.canvas.height;
    world.scene.updateProjection();
    initViewport(world.gl, world.canvas);
  }

  // ------------------------ SCREEN RESIZING HANDLERS -------------------------
  document.onwebkitfullscreenchange = function(){
    self.isFull = !self.isFull;
    self.resize();

    if(!self.isFull) goFull.src = "../imgs/fullS.png";
    else goFull.src = "../imgs/minimize.png";
  }
  document.onmozfullscreenchange = document.onwebkitfullscreenchange;
  document.onfullscreenchange = document.onmozfullscreenchange;
  document.MSFullscreenChange = document.onfullscreenchange;

  this.startRender = function(){
      self.renderIntervalID = window.setInterval(self.render, 16);
      self.updateInfoIntervalID = window.setInterval(self.updateInfo, 250);
  }
  this.stopRender = function(){
      clearInterval(self.renderIntervalID);
      clearInterval(self.updateInfoIntervalID);
  }
  this.render = function(){

      world.draw();

      /*
      for (var i = 0; i < world.bodies.length; i++){
            if(world.scene.selected === world.bodies[i].id){
                if(world.selected[world.scene.selected]){
                world.selected[world.scene.selected] = 0;
                world.bodies[i].sphere.color = world.colorBackup[i];
             }else{
                world.selected[world.scene.selected] = 1;
                world.bodies[i].sphere.color = [0, 1, 0.28, 1];
             }
             world.scene.selected = null;
           }
       }
       */
  }
  this.updateInfo = function(){

      /*
      world.updateBodies();
      var header =  `<tr>
                      <th>ID</th>
                      <th>Velocity x</th>
                      <th>Velocity y</th>
                      <th>Velocity z</th>
                      <th>Force x</th>
                      <th>Force y</th>
                      <th>Force z</th>
                    </tr>`;
       var tablecontent = "";

       for (var i = 0; i < world.bodies.length; i++) if(world.selected[i]) tablecontent += addRow(world.bodies[i]);

       this.particlesState.innerHTML = header + tablecontent;
       */

       this.time.innerHTML = "Simulation Time: " + world.time.toFixed(2) + " | Real time: " + world.Realtime.toFixed(1) + " | Error: " + ((world.Realtime - world.time)/ world.Realtime * 100).toFixed(2) + "%";
       this.particles.innerHTML = "Particles: " + world.id;
  }

  this.resize();
}
