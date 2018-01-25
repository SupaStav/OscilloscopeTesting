var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

// source = audioCtx.createMediaStreamSource(stream);
// source.connect(analyser);
var osc =audioCtx.createOscillator();
var pauseCounter=0;
var gain = audioCtx.createGain();
osc.connect(gain);
// gain.connect(analyser);
gain.gain.value= 0;
// osc.frequency.value = 0;
osc.type = 'sine';
osc.start();
gain.connect(audioCtx.destination);
graphGain = audioCtx.createGain();
graphGain.gain.value = 10;
gain.connect(graphGain);
graphGain.connect(analyser);

var canvas1 = document.getElementById('scope-1');
var canvasCtx1 = canvas1.getContext('2d');

var HEIGHT = canvas1.height;
var WIDTH = canvas1.width;
var midPoint = {x: WIDTH/2, y: HEIGHT/2};
var mute = false;
var isPaused = false;

analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

var timbre = 0;

function createGrid(ctx){
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
  //   while (gridLineX >= 0){
  //     ctx.moveTo(gridLineX, 0);
  //     ctx.lineTo(gridLineX, HEIGHT);
  //     gridLineX -= 100;
  // }
  // gridLineX = midPoint.x + 100;
  //   while (gridLineX <= WIDTH){
  //     ctx.moveTo(gridLineX, 0);
  //     ctx.lineTo(gridLineX, HEIGHT);
  //     gridLineX += 100;
  // }
  // gridLineY = midPoint.y - 100;
  // while (gridLineY >= 0){
  //     ctx.moveTo(0, gridLineY);
  //     ctx.lineTo(WIDTH, gridLineY);
  //
  //     gridLineY -= 100;
  // }
  // gridLineY = midPoint.y + 100;
  // while (gridLineY <= HEIGHT){
  //     ctx.moveTo(0, gridLineY);
  //     ctx.lineTo(WIDTH, gridLineY);
  //     gridLineY += 100;
  // }
  dashesX = midPoint.x - 20;
  while (dashesX >= 0){
      ctx.moveTo(dashesX, midPoint.y-5);
      ctx.lineTo(dashesX, midPoint.y+5);
      dashesX -= 20;
  }
  while (dashesX <= WIDTH){
      ctx.moveTo(dashesX, midPoint.y-5);
      ctx.lineTo(dashesX, midPoint.y+5);
      dashesX += 20;
  }
  dashesY = midPoint.y - 20;
  while (dashesY >= 0){
      ctx.moveTo(midPoint.x-5, dashesY);
      ctx.lineTo(midPoint.x+5, dashesY);
      dashesY -= 20;
  }
  dashesY = midPoint.y + 20;
  while (dashesY <= HEIGHT){
      ctx.moveTo(midPoint.x-5, dashesY);
      ctx.lineTo(midPoint.x+5, dashesY);
      dashesY += 20;
  }

  ctx.stroke();

}

// draw(canvasCtx1);
createGrid(canvasCtx1);

draw();

function draw(){
    drawRequest = requestAnimationFrame(draw);

  canvasCtx1.clearRect(0, 0, WIDTH, HEIGHT);
  createGrid(canvasCtx1);

    // window.requestAnimationFrame(draw.bind(canvasCtx, sampling, process_buffer, bufferSize));
//50 ms
//2.5s= 50x
//1/50th of canvas size
  // analyser.getByteTimeDomainData(dataArray);
//While True
  canvasCtx1.fillStyle = 'rgb(234, 240, 255)';
  // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx1.lineWidth = 1.5;
  canvasCtx1.strokeStyle = 'rgb(66, 229, 244)';
  canvasCtx1.beginPath();

// var cutLength = bufferSecs-length;
// var startPos = cutLength * dataLength;

var sliceWidth = WIDTH * 1.0 / dataArray.length;
// sampling = 20 * length;
analyser.getByteTimeDomainData(dataArray);
var x = 0;
      for(var i = 0; i < dataArray.length; i++) {
              var v = dataArray[i] / 128;

              // if(v > 1.5){
                // paused =false;
                // canvasCtx.strokeStyle = 'rgb(219, 4, 4)';
              // } else {
                // paused = true;
                // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
              // }
              // v = (v-1)*Yzoom+1;
              var y = v * HEIGHT/2;


              if(i === 0) {
                canvasCtx1.moveTo(x, y);
              } else {

                canvasCtx1.lineTo(x, y);

              }
              x+=sliceWidth;
          }
          // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

      // canvasCtx1.lineTo(WIDTH, HEIGHT/2);
      canvasCtx1.stroke();

    // }

setTimeout(()=>{
  cancelAnimationFrame(drawRequest);
}, 300);

};



var mouseDown = false;
var mousePos = { x:0, y:0 };
var lastPos = mousePos;
var drawCanvas = document.getElementById('draw-canvas');
var drawCanvasCtx = drawCanvas.getContext('2d');
const DRAWHEIGHT = drawCanvas.height;
const DRAWWIDTH = drawCanvas.width;
drawCanvasCtx.beginPath();
renderAxesLabels();
drawCanvas.addEventListener("mousedown", function (e) {

  mouseDown = true;
  mousePos = getMousePos(drawCanvas, e);




  var color = (mousePos.x/DRAWWIDTH) * 245;
  var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);
  // drawCanvasCtx.fillStyle = colorVal;
  // drawCanvasCtx.fillStyle = '#ff3da7';
  // drawCanvasCtx.fillRect(mousePos.x,mousePos.y,3,3);

  drawPoint();
  setVolume(mousePos.x/DRAWWIDTH);
  setFrequency(((mousePos.y/DRAWHEIGHT)-1)*-1);
}, false);
drawCanvas.addEventListener("mouseup", function (e) {
  e.preventDefault();
  mouseDown = false;
  gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
  renderAxesLabels();


}, false);
drawCanvas.addEventListener("mousemove", function (e) {
  mousePos = getMousePos(drawCanvas, e);

    renderCanvas();

}, false);

drawCanvas.addEventListener("touchstart", function (e) {
        mousePos = getTouchPos(drawCanvas, e);
  var touch = e.touches[0];
  var mouseEvent = new MouseEvent("mousedown", {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  drawCanvas.dispatchEvent(mouseEvent);
}, false);
drawCanvas.addEventListener("touchend", function (e) {
  var mouseEvent = new MouseEvent("mouseup", {});
  drawCanvas.dispatchEvent(mouseEvent);
}, false);
drawCanvas.addEventListener("touchmove", function (e) {
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
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.touches[0].clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.touches[0].clientY - rect.top) * scaleY
  };
}
// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }

}


function renderCanvas() {
    // drawCanvasCtx.moveTo(lastPos.x, lastPos.y);
      if(mouseDown){
        setVolume(mousePos.x/DRAWWIDTH);
        setFrequency(((mousePos.y/DRAWHEIGHT)-1)*-1);
    // drawCanvasCtx.fillStyle = '#ff3da7';
    var color = (mousePos.x/DRAWWIDTH) * 245;
    var colorVal = 'hsl(H, 100%, 70%)'.replace(/H/g, 255 - color);
    drawCanvasCtx.fillStyle = colorVal;
    drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
    renderAxesLabels();
    drawPoint();
    requestAnimationFrame(renderCanvas);
  }

}
function drawPoint(){
  // drawCanvasCtx.beginPath();
  // drawCanvasCtx.arc(mousePos.x,mousePos.y,2,0,2*Math.PI);
  drawCanvasCtx.fillStyle = 'black';
  drawCanvasCtx.fillRect(mousePos.x, mousePos.y, 5, 5);
  drawCanvasCtx.fillStyle = 'green';
  // drawCanvasCtx.fill();
  drawCanvasCtx.stroke();

}
function setVolume(vol){
  var newVolume = logspace(0.001,0.5, vol, 2);

  if(!mute){
  gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.2);
  }
}

function setFrequency(freq){
  isPaused = false;
  // pauseCounter=0;
  draw();


  var newFreq = logspace(50, 15000, freq,2);
  osc.frequency.setTargetAtTime(newFreq, audioCtx.currentTime, 0.2);
  // $('.swiper-indicator').text(Math.round(newFreq)+'Hz');
  // console.log(newFreq);
}

function logspace(start, stop, n, N){
    return start * Math.pow(stop/start, n/(N-1));
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

      var freq = ((i)/(ticks))
      var tickFreq = Math.round(logspace(50, 14852, freq,2));
      var switchAmp=((freq/ticks-1)*-1);
      var tickAmp = Math.round(logspace(0.001,0.5, switchAmp, 2)*100)/10*2;
      var percent  = i/(ticks);
      var y = (1-percent) * DRAWHEIGHT;

      var x = DRAWWIDTH - 60;
      // Get the value for the current y coordinate.
      var label;

      var ampX = (1-percent)*DRAWWIDTH+10;
      var ampY = DRAWHEIGHT - 0;
      // var units;
      // if (this.log) {

        // Handle a logarithmic scale.
        // var logIndex = this.logScale(index, maxSample)+minSample;


        // Never show 0 Hz.

        // freq = Math.max(1, this.indexToFreq(logIndex));
        // var freq = index/ticks
      //   freq = Math.max(1,this.getFrequencies(i));
      //
      // // var label = this.formatFreq(freq);
      // var units = this.formatUnits(freq);

      drawCanvasCtx.font = '12px Arial ';
      // Draw the value.
      drawCanvasCtx.textAlign = 'right';
      drawCanvasCtx.fillStyle = 'white';
      // if(y==0){
      //   y=2;
      // }
      drawCanvasCtx.fillText(tickFreq+' Hz', x+40, y + yLabelOffset);

      drawCanvasCtx.fillText(tickAmp, ampX+15, ampY)
      // // Draw the units.
      // drawCanvasCtx.textAlign = 'left';
      // drawCanvasCtx.fillStyle = 'white';
      // drawCanvasCtx.fillText(units, x + 10, y + yLabelOffset);
      // Draw a tick mark.
      drawCanvasCtx.fillRect(ampX+20, ampY-5, 3, 7);
      drawCanvasCtx.fillRect(x + 50, y, 10, 2);
    }
    //0 mark
    var x=DRAWWIDTH - 60;
    drawCanvasCtx.fillText(54, x+40, DRAWHEIGHT);
    drawCanvasCtx.fillRect(x + 50, DRAWHEIGHT-2, 10, 2);

  }

  $(document).ready(function () {
    //initialize swiper when document ready

    $('#pause-button').click ((e)=> {
      if(!isPaused) {
        isPaused = true;
        $('#pause-button').html("<img src='./resources/play.svg' style='height: 25px; width: 30px'></img>");
      }
      else {
        $('#pause-button').html("Pause");
        isPaused = false;
        draw();
      }
    });

    $('.mute-button').click((e)=> {
      if(mute){
        const muteHtml = `<img src='./resources/mute.svg' style='height: 25px; width: 30px'></img>`
        $('.mute-button').html(muteHtml);
      } else {
        const speakerHtml = `<img src='./resources/speaker.svg' style='height: 25px; width: 30px'></img>`
        $('.mute-button').html(speakerHtml);
        gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
      }
      mute = !mute;


    });
    $('.timbre-button').click((e)=>{
      timbre = (timbre+1)%4;
      switch (timbre) {
        case 0:
          osc.type = 'sine';
          $('.timbre-button').html("<img src='./resources/sine.png' style='height: 25px; width: 30px'></img>");
          break;
        case 1:
          osc.type = 'square';
          $('.timbre-button').html("<img src='./resources/square.png' style='height: 25px; width: 30px'></img>");
          break;
        case 2:
          osc.type = 'sawtooth';
          $('.timbre-button').html("<img src='./resources/saw.png' style='height: 25px; width: 30px'></img>");
          break;
        case 3:
          osc.type = 'triangle';
          $('.timbre-button').html("<img src='./resources/triangle.png' style='height: 25px; width: 30px'></img>");
          break;
        default:
          osc.type = 'sine';

      }
    });


$(document).mouseup(function(e){
      mouseDown = false;
      drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
      renderAxesLabels();
      gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);

    });
  });
