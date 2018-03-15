/* Things to improve:
    - Making the site fully responsive (in the 1st load its responsive, we need to do so when resizing)
    - Set a scale for drawing the axis in the right canvas, because now it prints more or less axes depending on the size of the page
    - When moving the cursor too fast outside the left canvas, the blue dot gets blocked
    - (Only a problem of the other types of waves) Sometimes, the wave obtained for two same positions of the blue dot is inconsistent
*/

/* To do:
    - Think of a possible design for data representation. x-axis : time, y-axis: voltage sent to the speaker
    - Plot the multiple waves thinner and the superposition wave in the back, thicker
    - Calculate the volume correctly
    - In the frequency representation. Dont put anything when no touching, try to find a nice way to represent all the finger frequencies
*/

// Setting the audio API and connecting all of its components.
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var osc = audioCtx.createOscillator();
var gain = audioCtx.createGain();
osc.connect(gain);
gain.gain.setValueAtTime(0, audioCtx.currentTime);
var type = "sine";
osc.type = type;
osc.start();
gain.connect(audioCtx.destination);
graphGain = audioCtx.createGain();
graphGain.gain.setValueAtTime(10, audioCtx.currentTime);
gain.connect(graphGain);
graphGain.connect(analyser);


// This function creates a Canvas with a good quality, using the pixel ratio of the device.
createHiDPICanvas = function(w, h, canvasName, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    // We create a canvas with the pixel ratio, in order to get the maximum quality
    var can = document.getElementById(canvasName);
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

// Declaration of some variables that we will need later
var PIXEL_RATIO;
// Scope canvas context, id of the scope canvas, the element itself
var scopeCtx, scopeId, scope;
// Width and height of the scope canvas element
var WIDTH, HEIGHT;
// Mid point of the scope canvas (used to create the grid)
var midPoint = {
  x: WIDTH / 2,
  y: HEIGHT / 2
};

// Boolean storing if the mouse is clicked or not
var mouseDown;
// Boolean storing if the mouse is moving or not
var mouseMove;

// Draw canvas context, id of the draw canvas, the element itself
var drawCanvasCtx, drawCanvasId, drawCanvas;
// Width and height of the draw canvas element
var DRAWHEIGHT, DRAWWIDTH;

// Type of wave we are displaying
var timbre = 0;

// Variables to store the data to make the wave
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

// Minimum and maximum frequencies in the table
var minFreq = 20;
var maxFreq = 20000;
// How sensitive is the program with the movement of the mouse/finger
// If very sensitive, it will be updated at the minimum change. If not sensitive, it will take longer to update.
var changeSensitivity = 0.015;

// Number of points in the graph (only for sine version)
var numberPoints = 2048*16;
// Time variable (only for sine version)
var t=0;

// Variable to keep track of the mouse/finger position (array done for each of the possible fingers)
var mousePos = [];
// Variable to keep track of the old frequency and old volume (array done for each of the possible fingers)
var oldFreq = [];
var oldVol = [];
// Variable to keep track of the frequency and volume (array done for each of the possible fingers)
var frequency=[];
var amplitude=[];
// Variable to keep track of the fingers touching the screen (only in finger mode)
var touch=[];
// Number of fingers touching the screen
var nFingers=0;
// Maximum number of fingers allowed in the system - 1
// If we put eleven fingers, an error is printed but the program does not crash
var MAXFINGERS = 11;
// Variable to traverse the fingers in different methods
var finger;

// This function will set up the two canvas that we are using in the application
function setCanvas() {
  // Function that calculates the pixel ratio of the device
  PIXEL_RATIO = (function () {
      var ctx = document.createElement("canvas").getContext("2d"),
          dpr = window.devicePixelRatio || 1,
          bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1;

      return dpr / bsr;
  })();

  //Create scope canvas with the device resolution and initialize the variables accordingly
  scopeId = document.getElementById('scope-1');
  HEIGHT = scopeId.clientHeight;
  WIDTH = scopeId.clientWidth;
  scope = createHiDPICanvas(WIDTH, HEIGHT, 'scope-1');
  scopeCtx = scope.getContext('2d');
  midPoint = {
    x: WIDTH / 2,
    y: HEIGHT / 2
  };
  // Initialize the mouse clicked and moved
  mouseDown = false;
  mouseMove = false;

  // Initialize our finger variables to their default values
  for (j=0; j<MAXFINGERS; j++){
    mousePos[j] = {
      x: 0,
      y: 0
    };
    oldFreq[j] = -1;
    oldVol[j] = -1;
    frequency[j] = 1;
    amplitude[j] = 0;
  }

  // Function to render the canvas
  draw();


  //Create draw canvas with the device resolution.
  drawCanvasId = document.getElementById('draw-canvas');
  DRAWHEIGHT = drawCanvasId.clientHeight;
  DRAWWIDTH = drawCanvasId.clientWidth;
  drawCanvas = createHiDPICanvas(DRAWWIDTH, DRAWHEIGHT, 'draw-canvas');
  drawCanvasCtx = drawCanvas.getContext('2d');
  // Function to render the canvas
  renderAxesLabels();
}

// We initially set both canvas
setCanvas();


// This function creates the grid of the canvas inserted as argument (it will be used for scope)
function createGrid(ctx) {
  // Draw the two gray axes
  ctx.beginPath();
  ctx.moveTo(0, midPoint.y);
  ctx.lineTo(WIDTH, midPoint.y);
  ctx.moveTo(midPoint.x, 0);
  ctx.lineTo(midPoint.x, HEIGHT);
  ctx.strokeStyle = "rgb(124, 124, 124)";
  ctx.lineWidth = '5';
  ctx.globalCompositeOperation = 'source-over';
  ctx.stroke();
  ctx.closePath();

  // Draw the white lines
  ctx.beginPath();
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = '5';

  // Dash Space determines the distance between white lines
  var dashSpace = 50;
  // Dash size determines the size of the white lines
  var dashSize = 17;

  // Draw the dashes of the left half of x axis
  let dashesX = midPoint.x - dashSpace;
  while (dashesX >= 0) {
    ctx.moveTo(dashesX, midPoint.y - dashSize);
    ctx.lineTo(dashesX, midPoint.y + dashSize);
    dashesX -= dashSpace;
  }
  // Draw the dashes of the right half of x axis
  dashesX = midPoint.x;
  while (dashesX <= WIDTH) {
    ctx.moveTo(dashesX, midPoint.y - dashSize);
    ctx.lineTo(dashesX, midPoint.y + dashSize);
    dashesX += dashSpace;
  }

  // Draw the dashes of the bottom half of y axis
  let dashesY = midPoint.y - dashSpace;
  while (dashesY >= 0) {
    ctx.moveTo(midPoint.x - dashSize, dashesY);
    ctx.lineTo(midPoint.x + dashSize, dashesY);
    dashesY -= dashSpace;
  }
  // Draw the dashes of the top half of y axis
  dashesY = midPoint.y;
  while (dashesY <= HEIGHT) {
    ctx.moveTo(midPoint.x - dashSize, dashesY);
    ctx.lineTo(midPoint.x + dashSize, dashesY);
    dashesY += dashSpace;
  }

  ctx.stroke();
}

// Scope canvas drawing
function draw() {
    var freqInfoMessage;

    if (nFingers < 2){
      if (frequency[0]===1){
        freqInfoMessage="0 Hz (cycles/second)";
      } else {
        freqInfoMessage=Math.round(frequency[0])+" Hz (cycles/second)";
      }
    } else {
      freqInfoMessage=nFingers+" Finger Mode";
    }


    document.getElementById("freq-info").innerHTML=freqInfoMessage;
    // We clear whatever is in scope and we create the grid again
    scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    createGrid(scopeCtx);

    //Draw Graph on Screen

    // We draw the blue wave line
    scopeCtx.beginPath();
    scopeCtx.strokeStyle = 'rgb(66, 229, 244)';
    scopeCtx.lineWidth = '5';
    // We get the x-distance between each point by dividing the total width by the number of points

    if (type==="sine"){

      var sliceWidth = WIDTH / numberPoints;
      // x starts at 0 (first point is at 0)
      t++;
      if (nFingers===0){
        var x = 0;
        // For each of the points that we have
        for (var i = 0; i < numberPoints; i++) {
          var wavelength = 60000 / frequency[0];
          var v = wavelength/frequency[0];
          var k = 2*Math.PI/wavelength;
          var y = (amplitude[0]* 350 * Math.cos(k*(x+v*t)) + HEIGHT/2);

          // We draw the point in the canvas
          if (i === 0) {
            scopeCtx.moveTo(x, y);
          } else {
            scopeCtx.lineTo(x, y);
          }
          // x moves the x-distance to the right
          x += sliceWidth;
        }
      } else {

        if (nFingers===1){
            scopeCtx.strokeStyle = 'rgb(66, 229, 244)';
        } else if (nFingers===2){
            scopeCtx.strokeStyle = 'rgb(246, 109, 244)';
        } else if (nFingers===3){
            scopeCtx.strokeStyle = 'rgb(101, 255, 0)';
        } else {
            scopeCtx.strokeStyle = 'rgb(2, 0, 185)';
        }
        // var x = 0;
        // // For each of the points that we have
        // for (var i = 0; i < numberPoints; i++) {
        //   var y=0;
        //
        //   for (j=0; j<nFingers; j++){
        //     var wavelength = 60000 / frequency[j];
        //     var v = wavelength/frequency[j];
        //     var k = 2*Math.PI/wavelength;
        //     y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
        //   }
        //   y+= HEIGHT/2;
        //   // We draw the point in the canvas
        //   if (i === 0) {
        //     scopeCtx.moveTo(x, y);
        //   } else {
        //     scopeCtx.lineTo(x, y);
        //   }
        //   // x moves the x-distance to the right
        //   x += sliceWidth;
        // }

        numberPoints = 2048*16/nFingers;
        for (j=0; j<nFingers; j++){
          // For each of the points that we have
          var x = 0;

          for (var i = 0; i < numberPoints; i++) {
            // Why 128?
            //var v = dataArray[i] / 128;
            // We get the height of the point
            //var y = v * HEIGHT / 2;
            var y=0;


            var wavelength = 60000 / frequency[j];
            var v = wavelength/frequency[j];
            var k = 2*Math.PI/wavelength;
            y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));

            y+= HEIGHT/2;
            // We draw the point in the canvas
            if (i === 0) {
              scopeCtx.moveTo(x, y);
            } else {
              scopeCtx.lineTo(x, y);
            }
            // x moves the x-distance to the right
            x += sliceWidth;
          }
        }
      }
    } else {

      var sliceWidth = WIDTH * 1.0 / dataArray.length;
      analyser.getByteTimeDomainData(dataArray);
      // x starts at 0 (first point is at 0)
      var x = 0;
      // For each of the points that we have
      for (var i = 0; i < numberPoints; i++) {
        var v = dataArray[i] / 128;
        // We get the height of the point
        var y = v * HEIGHT / 2;

        // We draw the point in the canvas
        if (i === 0) {
          scopeCtx.moveTo(x, y);
        } else {
          scopeCtx.lineTo(x, y);
        }
        // x moves the x-distance to the right
        x += sliceWidth;
      }

    }


    scopeCtx.stroke();
//  }
};


// Draw blue point where finger is, sets corresponding volume and frequency
function renderCanvas() {
  if (mouseDown) {
    if(graphGain.gain.value!=10){
      graphGain.gain.value = 10;
    }
    let setV = false;
    let setF = false;
    let setVj = setVolume(mousePos[0].x / DRAWWIDTH, 0);
    let setFj = setFrequency(((mousePos[0].y / DRAWHEIGHT) - 1) * -1, 0);
    setV = setV || setVj;
    setF = setF || setFj;
    for (j=1 ; j<nFingers; j++){
      // We set the volume and the frequency
      let setVj = setVolume(mousePos[j].x / DRAWWIDTH, j);
      let setFj = setFrequency(((mousePos[j].y / DRAWHEIGHT) - 1) * -1, j);
      setV = setV || setVj;
      setF = setF || setFj;
    }
    if(setV | setF){
      if(!mouseMove){
        setTimeout(()=>{
          draw();
        },150);
      }
      else {
        draw();
      }
    }

    // We clear the canvas to make sure we don't leave anything painted
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    // We redraw the axes and the point
    renderAxesLabels();
    drawPoint();
    // What is this for?
    requestAnimationFrame(renderCanvas);
  }
}

// Draw blue point where finger/mouse is
function drawPoint() {
  drawCanvasCtx.fillStyle = 'rgb(66, 229, 244)';
  // We choose a size and fill a rectangle in the middle of the pointer
  var rectSizeY = 18;
  var rectSizeX = 8;
  drawCanvasCtx.fillRect(mousePos[0].x-rectSizeX/2-2, mousePos[0].y-rectSizeY/2, rectSizeX, rectSizeY);
}

// Function that sets the volume to the value indicated as argument
function setVolume(vol, index) {
  var newVolume = logspace(0.001, 0.5, vol, 2);
  gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.05);
  var redraw = false;
  if (Math.abs(vol - oldVol[index]) > changeSensitivity) {
    draw();
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

// Function that sets the frequency to the value indicated as argument
function setFrequency(freq, index) {
  var newFreq = logspace(minFreq, maxFreq, freq, 2);
  osc.frequency.value = newFreq;
  frequency[index] = newFreq;
  var redraw = false;
  if (Math.abs(freq - oldFreq[index]) > changeSensitivity) {
    draw();
    oldFreq[index] = freq;
    redraw = true;
  }
  return redraw;
}


function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}

// Function that draws of the axes labels in the left canvas
function renderAxesLabels() {
  var ticks = 4;
  var yLabelOffset = 13;
  // Render the vertical frequency axis.
  for (var i = 0; i <= ticks; i++) {
    var freq = ((i) / (ticks))
    var tickFreq = Math.round(logspace(minFreq, maxFreq, freq, 2));
    var switchAmp = ((freq / ticks - 1) * -1);
    var tickAmp = Math.round(logspace(0.001, 0.5, switchAmp, 2) * 100) / 10 * 2;
    var percent = i / (ticks);
    var y = (1 - percent) * DRAWHEIGHT;
    var x = DRAWWIDTH;
    // Get the value for the current y coordinate.

    var ampX = (1 - percent) * DRAWWIDTH;
    var ampY = DRAWHEIGHT - 0;
    drawCanvasCtx.beginPath();
    drawCanvasCtx.font = '16px Verdana ';
    // Draw the value.
    drawCanvasCtx.textAlign = 'right';
    drawCanvasCtx.fillStyle = 'black';

    //y-axis
    drawCanvasCtx.fillText(tickFreq + ' Hz', parseInt(x)-29, parseInt(y + yLabelOffset));
    drawCanvasCtx.fillRect(parseInt(x)-19, parseInt(y), 24, 8);

    //x-axis
    drawCanvasCtx.fillText(tickAmp, parseInt(ampX)+45, parseInt(ampY)-10);
    drawCanvasCtx.fillRect(parseInt(ampX)+8, parseInt(ampY) -20, 7, 24);
  }
  // 0 mark

  drawCanvasCtx.fillText(minFreq + ' Hz', parseInt(x) - 7, parseInt(DRAWHEIGHT)-28);
  drawCanvasCtx.fillRect(parseInt(x) + - 19, parseInt(DRAWHEIGHT)-8, 24, 8);
}


// Whem the mouse is clicked, we will create a wave dependent on the mouse position
drawCanvas.addEventListener("mousedown", function(e) {
  gain.gain.cancelScheduledValues(0);
  mouseDown = true;
  mouseMove = false;

  if (nFingers === 0){
    mousePos[0] = getMousePos(drawCanvas, e);
    renderCanvas();
  } else {
    mousePos[finger] = getMousePos(drawCanvas, e);
  }

  if(osc == null){
    osc = audioCtx.createOscillator();
    osc.type = type;
    osc.start();
    osc.connect(gain);
  }
}, false);

// When the mouse moves, we keep track of its position.
drawCanvas.addEventListener("mousemove", function(e) {
  mouseMove = true;
  if (nFingers === 0){
    mousePos[0] = getMousePos(drawCanvas, e);
    renderCanvas();
  } else {
    mousePos[finger] = getMousePos(drawCanvas, e);
  }
}, false);

// When the user touches the screen, we simulate a mouse click
drawCanvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  if (nFingers<MAXFINGERS){
    nFingers++;
    var mouseEvent;
    touch = e.touches;
    for (j=0; j<nFingers; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousedown", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      drawCanvas.dispatchEvent(mouseEvent);
    }
    renderCanvas();
  }
}, false);

// When the user stops touching the screen, we simulate a mouse unclick
drawCanvas.addEventListener("touchend", function(e) {
  var indexFingerUp;

  for (j=0; j<nFingers; j++){
    if (touch[j].clientX === e.changedTouches[0].clientX && touch[j].clientY === e.changedTouches[0].clientY){
      indexFingerUp = j;
    }
  }

  nFingers--;

  mousePos.splice(indexFingerUp, 1);
  oldFreq.splice(indexFingerUp, 1);
  oldVol.splice(indexFingerUp, 1);
  frequency.splice(indexFingerUp, 1);
  amplitude.splice(indexFingerUp, 1);
  mousePos.push({x: 0, y: 0});
  oldFreq.push(-1);
  oldVol.push(-1);
  frequency.push(1);
  amplitude.push(0);

  if (nFingers===0){
    touch = [];
    setToZero();
  } else {
    draw();
  }
}, false);

// When the user moves its fingers in the screen, we simulate a mouse move
drawCanvas.addEventListener("touchmove", function(e) {
  if (nFingers<= MAXFINGERS){
    var mouseEvent;
    touch = e.touches;
    for (j=0; j<nFingers; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousedown", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      drawCanvas.dispatchEvent(mouseEvent);
    }
    renderCanvas();
  }
}, false);

// Resize function to resize the canvas correctly (not working)
// window.addEventListener("resize", setCanvas);


// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(); // abs. size of element
  return {
    x: (evt.clientX - rect.left), // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) // been adjusted to be relative to element
  }
}

function setToZero(){
  if(mouseDown){
    mouseDown = false;
    mouseMove = false;
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    renderAxesLabels();
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime+0.2);
    graphGain.gain.value = 0;
    oldFreq[0] = -1;
    oldVol[0] = -1;
    frequency[0]= 1;
    amplitude[0]= 0;
    mousePos[0] = {
      x: 0,
      y: 0
    };
    if (type === "sine"){
      draw();
    } else {
      setTimeout(()=>{
        scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
        createGrid(scopeCtx);
        draw();
      },100);
    }

  }
}

// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {

  // Alternative to jQuery click function
  document.getElementById("timbre-button").onclick = function () {
    timbre = (timbre + 1) % 4;
    switch (timbre) {
      case 0:
        type = 'sine';
        document.getElementById("timbre-button").innerHTML="<img src='./resources/sine.png' style='height: 25px; width: 30px'></img>";
        break;
      case 1:
        type = 'square';
        document.getElementById("timbre-button").innerHTML="<img src='./resources/square.png' style='height: 25px; width: 30px'></img>";
        break;
      case 2:
        type = 'sawtooth';
        document.getElementById("timbre-button").innerHTML="<img src='./resources/saw.png' style='height: 25px; width: 30px'></img>";
        break;
      case 3:
        type = 'triangle';
        document.getElementById("timbre-button").innerHTML="<img src='./resources/triangle.png' style='height: 25px; width: 30px'></img>";
        break;
      default:
        type = 'sine';
        document.getElementById("timbre-button").innerHTML="<img src='./resources/sine.png' style='height: 25px; width: 30px'></img>";
    }
    if (osc){
      osc.stop(audioCtx.currentTime+0.1);
      osc = null;
    }
    osc = audioCtx.createOscillator();
    osc.connect(gain);
    osc.type = type;
    osc.start();
  }


  // Alternative to jQuery mouseup function
  document.onmouseup = function(){
    setToZero();
  }
});
