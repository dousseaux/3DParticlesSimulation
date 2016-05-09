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
}

// ------------------------------- RETURNS JSON STRING ----------------------------------
function dataToJSON(data){
    return "data:text/json; charset=utf-16," + encodeURIComponent(JSON.stringify(data));
}

// ----------------------------- CONVERT OBJECT TO ARRAY --------------------------------
function objToArray(obj){
    return Object.keys(obj).map(function(key){return obj[key]});
}
