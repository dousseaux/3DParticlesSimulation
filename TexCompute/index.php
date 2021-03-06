<head>

    <title> Particles Simulation 3D </title>
    <link href='https://fonts.googleapis.com/css?family=Oswald:400,700,300' rel='stylesheet' type='text/css'>
    <link href='libs/style.css' rel='stylesheet' type="text/css">

</head>

<body>

  <meta id="viewport" name="viewport" content="initial-scale=1.0 user-scalable=0 minimum-scale=1.0 maximum-scale=1.0" />

    <div id="header">
      <img id="logo" src="../imgs/logo.png">
      <h1> 3D Particles Simulation</h1>
      <a id="JSONdownload"> Download JSON File</a>
    </div>

    <div id="container">

        <canvas id="screen" width="800" height="600">
        </canvas>

        <div id="menu">
            <img id="pause" class="icon" src="../imgs/pause.png"><br>
            <img id="add" class="icon" src="../imgs/add.png"><br>
            <img id="remove" class="icon" src="../imgs/remove.png"><br>
            <img id="restart" class="icon" src="../imgs/restart.png"><br>
            <div>
              <div id="specs">
                <div>
                  <h2> Physics Settings </h2>
                  <img id="pinSpecs" src="../imgs/pin.png"><br>
                  <br>

                  Gravity (pixels/step<sup>2</sup>):
                  <input id="gravityInput" type="text" name="gravity" width="100px">
                  <br>

                  Friction (kg/step):
                  <input id="frictionInput" type="text" name="friction" width="100px">
                  <br>

                  Interaction 1:
                  <br>
                  <textarea id="interactCode1" cols="30" rows="3"></textarea>
                  <br>
                  Interaction 2:
                  <br>
                  <textarea id="interactCode2" cols="30" rows="3"></textarea>
                  <br>
                </div>
              </div>
              <img id="phys" class="icon" src="../imgs/physics.png"><br>
            </div>
            <div>
              <div id="simulationInfo">
                <span id="status"><span id="time"></span><span id="particles"></span></span>
                <img id="pinSimuInfo" src="../imgs/pin.png"><br>
                <table id="particlesState" cellspacing="0"></table>
              </div>
              <img id="analysis" class="icon" src="../imgs/analysis.png"><br>
            </div>
            <div>
              <div id="settingsmenu">
                <div>
                  <button id="activeWalls">Active Walls</button>
                  <button id="activeEdges">Active Edges</button>
                  <button id="saveModel">Save Model</button>
                  <button id="uploadModel">Upload Model</button>
                  <input type="file" id="uploader" style="display:none">
                  <a id="downloader"></a>
                </div>
              </div>
              <img id="settings" class="icon" src="../imgs/settings.png"><br>
            </div>
            <img id="goFull" class="icon" src="../imgs/fullS.png"><br>
        </div>
        <div id="side"></div>
    </div>

    <script id='DVertexShader' type='text/glsl'><?php readfile('shaders/DVertexShader.glsl') ?></script>
    <script id='DFragmentShader' type='text/glsl'><?php readfile('shaders/DFragmentShader.glsl') ?></script>
    <script id='CVertexShader' type='text/glsl'><?php readfile('shaders/CVertexShader.glsl') ?></script>
    <script id='CFragmentShader0' type='text/glsl'><?php readfile('shaders/CFragmentShader0.glsl') ?></script>
    <script id='CFragmentShader1' type='text/glsl'><?php readfile('shaders/CFragmentShader1.glsl') ?></script>
    <script id='CFragmentShader2' type='text/glsl'><?php readfile('shaders/CFragmentShader2.glsl') ?></script>
    <script id='CFragmentShader3' type='text/glsl'><?php readfile('shaders/CFragmentShader3.glsl') ?></script>
    <script id='SVertexShader' type='text/glsl'><?php readfile('shaders/SVertexShader.glsl') ?></script>
    <script id='SFragmentShader' type='text/glsl'><?php readfile('shaders/SFragmentShader.glsl') ?></script>

    <script src='libs/view.js'></script>
    <script src='libs/JSFun.js'></script>
    <script src='libs/GLFun.js'></script>

    <script src='particlesSimulation.js'></script>
    <script src='GPUcomputing.js'></script>
    <script src='forces.js'></script>

</body>
