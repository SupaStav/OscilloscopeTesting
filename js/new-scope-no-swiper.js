var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var osc = audioCtx.createOscillator();
var pauseCounter = 0;
var gain = audioCtx.createGain();
osc.connect(gain);
gain.gain.setValueAtTime(0, audioCtx.currentTime);
var type = "sine"
osc.type = type;
osc.start();
gain.connect(audioCtx.destination);
graphGain = audioCtx.createGain();
graphGain.gain.setValueAtTime(10, audioCtx.currentTime);
gain.connect(graphGain);
graphGain.connect(analyser);

var scope = document.getElementById('scope-1');
var scopeCtx = scope.getContext('2d');

var HEIGHT = scope.height;
var WIDTH = scope.width;
var midPoint = {
  x: WIDTH / 2,
  y: HEIGHT / 2
};
var mute = false;
var isPaused = false;

var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

var timbre = 0;

function createGrid(ctx) {
  ctx.beginPath();
  ctx.moveTo(0, midPoint.y);
  ctx.lineTo(WIDTH, midPoint.y);
  ctx.moveTo(midPoint.x, 0);
  ctx.lineTo(midPoint.x, HEIGHT);
  ctx.strokeStyle = "rgb(255, 255, 255)";
  ctx.lineWidth = '1';
  ctx.globalCompositeOperation = 'source-over';
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  gridLineX = midPoint.x - 100;
  ctx.lineWidth = '2';

  dashesX = midPoint.x - 20;
  while (dashesX >= 0) {
    ctx.moveTo(dashesX, midPoint.y - 5);
    ctx.lineTo(dashesX, midPoint.y + 5);
    dashesX -= 20;
  }
  while (dashesX <= WIDTH) {
    ctx.moveTo(dashesX, midPoint.y - 5);
    ctx.lineTo(dashesX, midPoint.y + 5);
    dashesX += 20;
  }
  dashesY = midPoint.y - 20;
  while (dashesY >= 0) {
    ctx.moveTo(midPoint.x - 5, dashesY);
    ctx.lineTo(midPoint.x + 5, dashesY);
    dashesY -= 20;
  }
  dashesY = midPoint.y + 20;
  while (dashesY <= HEIGHT) {
    ctx.moveTo(midPoint.x - 5, dashesY);
    ctx.lineTo(midPoint.x + 5, dashesY);
    dashesY += 20;
  }

  ctx.stroke();

}

draw();

function draw() {
  if (!isPaused) {
    // drawRequest = requestAnimationFrame(draw);
    // isPaused = true;
    scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    createGrid(scopeCtx);

    //Draw Graph on Screen

    // scopeCtx.fillStyle = 'rgb(234, 240, 255)';
    // scopeCtx.lineWidth = 1.5;
    scopeCtx.strokeStyle = 'rgb(66, 229, 244)';
    scopeCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / dataArray.length;
    analyser.getByteTimeDomainData(dataArray);
    var x = 0;
    for (var i = 0; i < dataArray.length; i++) {
      var v = dataArray[i] / 128;

      var y = v * HEIGHT / 2;

      if (i === 0) {
        scopeCtx.moveTo(x, y);
      } else {

        scopeCtx.lineTo(x, y);

      }
      x += sliceWidth;
    }

    scopeCtx.stroke();
  }

};


//Draw Canvas
var mouseDown = false;
var mousePos = {
  x: 0,
  y: 0
};
var lastPos = mousePos;
var oldFreq = -1;
var oldVol = -1;
var drawCanvas = document.getElementById('draw-canvas');
var drawCanvasCtx = drawCanvas.getContext('2d');
const DRAWHEIGHT = drawCanvas.height;
const DRAWWIDTH = drawCanvas.width;
drawCanvasCtx.beginPath();
renderAxesLabels();

drawCanvas.addEventListener("mousedown", function(e) {
  mouseDown = true;
  mousePos = getMousePos(drawCanvas, e);

  var color = (mousePos.x / DRAWWIDTH) * 245;
  var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);

  if(osc == null){
    // console.log(type);
    osc = audioCtx.createOscillator();
    osc.connect(gain);
    osc.type = type;
    osc.start();
  }
  drawPoint();
  setVolume(mousePos.x / DRAWWIDTH);
  setFrequency(((mousePos.y / DRAWHEIGHT) - 1) * -1);

}, false);
drawCanvas.addEventListener("mouseup", function(e) {

  e.preventDefault();
  mouseDown = false;
  gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);
  drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
  renderAxesLabels();
  //setTimeout(()=>{
  scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
  createGrid(scopeCtx);
  if(osc){
    osc.stop(audioCtx.currentTime+0.1);

    osc = null;
  }

  //},55);

}, false);
drawCanvas.addEventListener("mousemove", function(e) {
  mousePos = getMousePos(drawCanvas, e);
  renderCanvas();

}, false);

drawCanvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  mousePos = getTouchPos(drawCanvas, e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  drawCanvas.dispatchEvent(mouseEvent);
}, false);
drawCanvas.addEventListener("touchend", function(e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  drawCanvas.dispatchEvent(mouseEvent);
}, false);
drawCanvas.addEventListener("touchmove", function(e) {
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousemove", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  drawCanvas.dispatchEvent(mouseEvent);
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (evt.touches[0].clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.touches[0].clientY - rect.top) * scaleY
  };
}
// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY // been adjusted to be relative to element
  }
}

// Draw blue point where finger is, sets corresponding volume and frequency
function renderCanvas() {
  if (mouseDown) {
    setVolume(mousePos.x / DRAWWIDTH);
    setFrequency(((mousePos.y / DRAWHEIGHT) - 1) * -1);

    var color = (mousePos.x / DRAWWIDTH) * 245;
    var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);
    drawCanvasCtx.fillStyle = colorVal;
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    renderAxesLabels();
    drawPoint();
    requestAnimationFrame(renderCanvas);
  }

}

function drawPoint() {
  drawCanvasCtx.fillStyle = 'rgb(66, 229, 244)';
  drawCanvasCtx.fillRect(mousePos.x, mousePos.y, 9, 4);
}

function setVolume(vol) {
  var newVolume = logspace(0.001, 0.5, vol, 2);
  if (Math.abs(vol - oldVol) > 0.01) {
    draw();
  }
  oldVol = vol;
  if (!mute) {
    gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.05);
  }
}

function setFrequency(freq) {
  var newFreq = logspace(50, 15000, freq, 2);
  if (Math.abs(freq - oldFreq) > 0.01) {
    draw();
    oldFreq = freq;
  }
  osc.frequency.value = newFreq;

}

function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}

function renderAxesLabels() {
  var startFreq = 440;
  startFreq = 50;
  var endFreq = 15000;
  var ticks = 4;
  var step = (endFreq - startFreq) / ticks;
  var yLabelOffset = 10;
  var width = window.innerWidth;
  var height = window.innerHeight;
  // Render the vertical frequency axis.
  for (var i = 0; i <= ticks; i++) {
    //Inital Vals = 100, 161, 403, 1366, 4967, 19000
    // var freq = startFreq + (step * (i+1));
    // Get the y coordinate from the current label.
    // var index = this.freqToIndex(freq);

    var freq = ((i) / (ticks))
    var tickFreq = Math.round(logspace(50, 14852, freq, 2));
    var switchAmp = ((freq / ticks - 1) * -1);
    var tickAmp = Math.round(logspace(0.001, 0.5, switchAmp, 2) * 100) / 10 * 2;
    var percent = i / (ticks);
    var y = (1 - percent) * DRAWHEIGHT;

    var x = DRAWWIDTH - 60;
    // Get the value for the current y coordinate.
    var label;

    var ampX = (1 - percent) * DRAWWIDTH + 10;
    var ampY = DRAWHEIGHT - 0;

    drawCanvasCtx.font = '10px Verdana ';
    // Draw the value.
    drawCanvasCtx.textAlign = 'right';
    drawCanvasCtx.fillStyle = 'black';

    //y-axis
    drawCanvasCtx.fillText(tickFreq + ' Hz', x + 40, y + yLabelOffset);
    drawCanvasCtx.fillStyle = 'black';
    drawCanvasCtx.fillRect(x + 50, y, 10, 2);

    //x-axis
    drawCanvasCtx.fillStyle = 'black';
    drawCanvasCtx.fillText(tickAmp, ampX + 23, ampY)
    drawCanvasCtx.fillStyle = 'black';
    drawCanvasCtx.fillRect(ampX, ampY - 5, 3, 7);
  }
  // 0 mark
  drawCanvasCtx.fillStyle = 'black';
  var x = DRAWWIDTH - 60;
  drawCanvasCtx.fillText(54 + ' Hz', x + 55, DRAWHEIGHT - 5);
  drawCanvasCtx.fillStyle = 'black';
  drawCanvasCtx.fillRect(x + 50, DRAWHEIGHT - 2, 10, 2);
}

$(document).ready(function() {

  $('#pause-button').click((e) => {
    if (!isPaused) {
      isPaused = true;
      $('#pause-button').html("<img src='./resources/play.svg' style='height: 25px; width: 30px'></img>");
    } else {
      $('#pause-button').html("Pause");
      isPaused = false;
      draw();
    }
  });

  $('.mute-button').click((e) => {
    if (mute) {
      const muteHtml = `<img src='./resources/mute.svg' style='height: 25px; width: 30px'></img>`
      $('.mute-button').html(muteHtml);
    } else {
      const speakerHtml = `<img src='./resources/speaker.svg' style='height: 25px; width: 30px'></img>`
      $('.mute-button').html(speakerHtml);
      gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
    }
    mute = !mute;

  });
  $('.timbre-button').click((e) => {
    timbre = (timbre + 1) % 4;
    switch (timbre) {
      case 0:
        type = 'sine';
        $('.timbre-button').html("<img src='./resources/sine.png' style='height: 25px; width: 30px'></img>");
        break;
      case 1:
        type = 'square';
        $('.timbre-button').html("<img src='./resources/square.png' style='height: 25px; width: 30px'></img>");
        break;
      case 2:
        type = 'sawtooth';
        $('.timbre-button').html("<img src='./resources/saw.png' style='height: 25px; width: 30px'></img>");
        break;
      case 3:
        type = 'triangle';
        $('.timbre-button').html("<img src='./resources/triangle.png' style='height: 25px; width: 30px'></img>");
        break;
      default:
        type = 'sine';

    }
  });

  $(document).mouseup(function(e) {
    mouseDown = false;
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    renderAxesLabels();
    gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    scopeCtx.clearRect(0, 0, WIDTH, HEIGHT);
    createGrid(scopeCtx);

  });
});
