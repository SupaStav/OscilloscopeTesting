/* Things to improve:
    - Making the site fully responsive (in the 1st load its responsive, we need to do so when resizing)
    - Set a scale for drawing the axis in the right canvas, because now it prints more or less axes depending on the size of the page
    - When moving the cursor too fast outside the left canvas, the blue dot gets blocked
    - (Only a problem of the other types of waves) Sometimes, the wave obtained for two same positions of the blue dot is inconsistent
    - Set up the constants in order to satisfy professor
    - When going to the extreme, the sine wave is not perfect, but we should not increase the #points due to performance reasons
    - t=0 or t++ effect?
    - multiple fingers mode
    - los volumenes no se superponen en el 2 fingers mode
*/

// Setting the audio API and connecting all of its components.
var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var osc = audioCtx.createOscillator();
//var pauseCounter = 0;
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
var midPoint = {
  x: WIDTH / 2,
  y: HEIGHT / 2
};

var MAXFINGERS = 10;

// Boolean storing if the mouse is clicked or not
var mouseDown;
var mouseMove;
// Variables to keep track of the mouse position
var mousePos = [];
//var lastPos = mousePos;
// Variables to keep track of the frequency and volume
var oldFreq = [];
var oldVol = [];
// Draw canvas context, id of the draw canvas, the element itself
var drawCanvasCtx, drawCanvasId, drawCanvas;
// Width and height of the draw canvas element
var DRAWHEIGHT, DRAWWIDTH;

//var mute = false;
//var isPaused = false;
var timbre = 0;

// Variables to store the data to make the wave
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

var minFreq = 20;
var maxFreq = 20000;
var changeSensitivity = 0.015;
var numberPoints = 2048*16;
var t=0;
var frequency=[];
var amplitude=[];
var nFingers=0;
var finger;
var touch=[];

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

  //Create scope canvas with the device resolution.
  //var scope = document.getElementById('scope-1');
  scopeId = document.getElementById('scope-1');
  HEIGHT = scopeId.clientHeight;
  WIDTH = scopeId.clientWidth;
  scope = createHiDPICanvas(WIDTH, HEIGHT, 'scope-1');
  scopeCtx = scope.getContext('2d');

  midPoint = {
    x: WIDTH / 2,
    y: HEIGHT / 2
  };


  mouseDown = false;
  for (j=0; j<MAXFINGERS; j++){
    mousePos[j] = {
      x: 0,
      y: 0
    };
    //lastPos = mousePos;
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
  //var drawCanvas = document.getElementById('draw-canvas');
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
  //gridLineX = midPoint.x - 100;
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
//  if (!isPaused) {
    //drawRequest = requestAnimationFrame(draw);
    // isPaused = true;
    var freqInfoMessage;

    //console.log(touch);
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

    // scopeCtx.fillStyle = 'rgb(234, 240, 255)';
    // scopeCtx.lineWidth = 1.5;

    // We draw the blue wave line
    scopeCtx.beginPath();
    scopeCtx.strokeStyle = 'rgb(66, 229, 244)';
    scopeCtx.lineWidth = '5';
    // We get the x-distance between each point by dividing the total width by the number of points

    if (type==="sine"){

      //var sliceWidth = WIDTH * 1.0 / dataArray.length;
      var sliceWidth = WIDTH / numberPoints;
      //analyser.getByteTimeDomainData(dataArray);
      // x starts at 0 (first point is at 0)
      t++;
      if (nFingers===0){
        var x = 0;
        // For each of the points that we have
        for (var i = 0; i < numberPoints; i++) {
          // Why 128?
          //var v = dataArray[i] / 128;
          // We get the height of the point
          //var y = v * HEIGHT / 2;

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
        numberPoints = 2048*16/nFingers;
        if (nFingers===1){
            scopeCtx.strokeStyle = 'rgb(66, 229, 244)';
        } else if (nFingers===2){
            scopeCtx.strokeStyle = 'rgb(246, 109, 244)';
        } else if (nFingers===3){
            scopeCtx.strokeStyle = 'rgb(101, 255, 0)';
        } else {
            scopeCtx.strokeStyle = 'rgb(2, 0, 185)';
        }
        var x = 0;
        // For each of the points that we have
        for (var i = 0; i < numberPoints; i++) {
          // Why 128?
          //var v = dataArray[i] / 128;
          // We get the height of the point
          //var y = v * HEIGHT / 2;
          var y=0;

          for (j=0; j<nFingers; j++){
            var wavelength = 60000 / frequency[j];
            var v = wavelength/frequency[j];
            var k = 2*Math.PI/wavelength;
            y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
          }
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


        // for (j=0; j<nFingers; j++){
        //   // For each of the points that we have
        //   var x = 0;
        //
        //   for (var i = 0; i < numberPoints; i++) {
        //     // Why 128?
        //     //var v = dataArray[i] / 128;
        //     // We get the height of the point
        //     //var y = v * HEIGHT / 2;
        //     var y=0;
        //
        //
        //     var wavelength = 60000 / frequency[j];
        //     var v = wavelength/frequency[j];
        //     var k = 2*Math.PI/wavelength;
        //     y += (amplitude[j]* 350 * Math.cos(k*(x+v*t)));
        //
        //     y+= HEIGHT/2;
        //     // We draw the point in the canvas
        //     if (i === 0) {
        //       scopeCtx.moveTo(x, y);
        //     } else {
        //       scopeCtx.lineTo(x, y);
        //     }
        //     // x moves the x-distance to the right
        //     x += sliceWidth;
        //   }
        // }
      }
    } else {

      var sliceWidth = WIDTH * 1.0 / dataArray.length;
      analyser.getByteTimeDomainData(dataArray);
      // x starts at 0 (first point is at 0)
      var x = 0;
      // For each of the points that we have
      for (var i = 0; i < numberPoints; i++) {
        // Why 128?
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

    //var color = (mousePos.x / DRAWWIDTH) * 245;
    //var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);
    //drawCanvasCtx.fillStyle = colorVal;

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
/*  if (!mute) {
    gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.05);
  }
*/
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
  //var startFreq = 440;
  //startFreq = 50;
  //var endFreq = 15000;
  var ticks = 4;
  //var step = (endFreq - startFreq) / ticks;
  var yLabelOffset = 13;
  //var width = window.innerWidth;
  //var height = window.innerHeight;
  // Render the vertical frequency axis.
  for (var i = 0; i <= ticks; i++) {
    //Inital Vals = 100, 161, 403, 1366, 4967, 19000
    // var freq = startFreq + (step * (i+1));
    // Get the y coordinate from the current label.
    // var index = this.freqToIndex(freq);

    var freq = ((i) / (ticks))
    var tickFreq = Math.round(logspace(minFreq, maxFreq, freq, 2));
    var switchAmp = ((freq / ticks - 1) * -1);
    var tickAmp = Math.round(logspace(0.001, 0.5, switchAmp, 2) * 100) / 10 * 2;
    var percent = i / (ticks);
    var y = (1 - percent) * DRAWHEIGHT;
    var x = DRAWWIDTH;
    // Get the value for the current y coordinate.
    //var label;

    //var ampX = (1 - percent) * DRAWWIDTH + 10;
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

//  var color = (mousePos.x / DRAWWIDTH) * 245;
//  var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);

  if(osc == null){
    osc = audioCtx.createOscillator();
    osc.type = type;
    osc.start();
    osc.connect(gain);
  }
  //mousePos = getMousePos(drawCanvas, e);
  //drawPoint();
  //setVolume(mousePos.x / DRAWWIDTH);
  //setFrequency(((mousePos.y / DRAWHEIGHT) - 1) * -1);

}, false);

// When the mouse is unclicked, we delete the wave and return to the original canvas
// drawCanvas.addEventListener("mouseup", function(e) {
//   e.preventDefault();
//   mouseDown = false;
//   mouseMove = false;
//   drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
//   renderAxesLabels();
//   gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
//   oldFreq = -1;
//   oldVol = -1;
//   setTimeout(()=>{
//     scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
//     createGrid(scopeCtx);
//     draw();
//
//   },400);
//
// }, false);

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
  //mousePos = getTouchPos(drawCanvas, e);
  if (nFingers<MAXFINGERS){
    nFingers++;
  }
  var mouseEvent;
  touch = e.touches;
  for (j=0; j<nFingers; j++){
    finger = j;
    //touch [j] = e.touches[j];
    mouseEvent = new MouseEvent("mousedown", {
      clientX: touch[j].clientX,
      clientY: touch[j].clientY
    });
    drawCanvas.dispatchEvent(mouseEvent);
  }
  renderCanvas();
}, false);

// When the user stops touching the screen, we simulate a mouse unclick
drawCanvas.addEventListener("touchend", function(e) {
  //var mouseEvent = new MouseEvent("mouseup", {});
  //drawCanvas.dispatchEvent(mouseEvent);
  var indexFingerUp;

  for (j=0; j<nFingers; j++){
    if (touch[j].clientX === e.changedTouches[0].clientX && touch[j].clientY === e.changedTouches[0].clientY){
      indexFingerUp = j;
    }
  }

  nFingers--;
  // var newIndexTouch=0;
  // var newTouch = [];
  //
  // for (j=0; j<nFingers; j++){
  //   if (j !== indexFingerUp){
  //     newTouch [newIndexTouch] = touch [j];
  //     mousePos[newIndexTouch] = mousePos [j];
  //     //lastPos = mousePos;
  //     oldFreq[newIndexTouch] = oldFreq [j];
  //     oldVol[newIndexTouch] = oldVol [j];
  //     frequency[newIndexTouch] = frequency [j];
  //     amplitude[newIndexTouch] = amplitude [j];
  //     newIndexTouch++;
  //   }
  // }
  // touch = newTouch;

  //touch.splice(indexFingerUp, 1);
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
  var mouseEvent;
  //touch = e.touches;
  touch = e.touches;
  for (j=0; j<nFingers; j++){
    finger = j;
    //touch [j] = e.touches[j];
    mouseEvent = new MouseEvent("mousedown", {
      clientX: touch[j].clientX,
      clientY: touch[j].clientY
    });
    drawCanvas.dispatchEvent(mouseEvent);
  }
  renderCanvas();
}, false);

// Resize function to resize the canvas correctly (not working)
window.addEventListener("resize", setCanvas);

// Get the position of a touch relative to the canvas
function getTouchPos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(); // abs. size of element
    //scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    //scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    //x: (evt.touches[0].clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    //y: (evt.touches[0].clientY - rect.top) * scaleY
    x: (evt.touches[0].clientX - rect.left),
    y: (evt.touches[0].clientY - rect.top)
  };
}


// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(); // abs. size of element
//  scaleX = canvas.width / rect.width; // relationship bitmap vs. element for X
//  scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
  //  x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
  //  y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
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
  //});
}

//$(document).ready(function() {

// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {

  /*$('#pause-button').click((e) => {
    if (!isPaused) {
      isPaused = true;
      $('#pause-button').html("<img src='./resources/play.svg' style='height: 25px; width: 30px'></img>");
    } else {
      $('#pause-button').html("Pause");
      isPaused = false;
      draw();
    }
  });*/


  //$('.mute-button').click((e) => {

  // Alternative to jQuery click function
/*  document.getElementById("mute-button").onclick = function () {
    if (mute) {
      const muteHtml = `<img src='./resources/mute.svg' style='height: 25px; width: 30px'></img>`
      document.getElementById("mute-button").innerHTML=muteHtml;
    } else {
      const speakerHtml = `<img src='./resources/speaker.svg' style='height: 25px; width: 30px'></img>`
      document.getElementById("mute-button").innerHTML=speakerHtml;
      gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    }
    mute = !mute;
  //});
  }
*/

  // $('.timbre-button').click((e) => {

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
  //});
  }


  //$(document).mouseup(function(e) {

  // Alternative to jQuery mouseup function
  document.onmouseup = function(){
    // mouseDown = false;
    // mouseMove = false;
    // drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    // renderAxesLabels();
    // //setTimeout(()=>{
    // gain.gain.setValueAtTime(0, audioCtx.currentTime+0.02);
    // oldFreq = -1;
    // oldVol = -1;
    // setTimeout(()=>{
    //   scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    //   createGrid(scopeCtx);
    //   draw();
    //
    // },80);
    setToZero();
  //});
  }
});
