var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();

// source = audioCtx.createMediaStreamSource(stream);
// source.connect(analyser);
var osc =audioCtx.createOscillator();
var gain = audioCtx.createGain();
osc.connect(gain);
// gain.connect(analyser);
gain.gain.value= logspace(0.001,0.1, 0.5, 2);
osc.frequency.value = logspace(50, 15000, 0.3333,2);
osc.type = 'square';
osc.start();
gain.connect(audioCtx.destination);
graphGain = audioCtx.createGain();
graphGain.gain.value = 20;
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
draw();

function draw(){
  if(!isPaused){
    requestAnimationFrame(draw);

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

  canvasCtx1.lineWidth = 2;
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

      canvasCtx1.lineTo(WIDTH, HEIGHT/2);
      canvasCtx1.stroke();
    }
};

$(document).ready(function () {
  //initialize swiper when document ready
  var mySwiper1 = new Swiper ('.swiper1', {
    // Optional parameters
    direction: 'vertical',
    loop: false,
    freeMode: true,
    freeModeMomentumVelocityRatio: 2,
    effect: 'coverflow',
    coverflowEffect: {
       rotate: 50,
       stretch: 0,
       depth: 100,
       modifier: 1,
       slideShadows : true,
     },
     initialSlide: 4,
     watchSlidesProgress: true,

  });
  var mySwiper2 = new Swiper ('.swiper2', {
    // Optional parameters
    direction: 'vertical',
    loop: false,
    freeMode: true,
    freeModeMomentumVelocityRatio: 2,
    effect: 'coverflow',
    coverflowEffect: {
       rotate: 50,
       stretch: 0,
       depth: 100,
       modifier: 1,
       slideShadows : true,
     },
     initialSlide: 3,

  });
  $('#pause-button').click ((e)=> {
    if(!isPaused) {
      isPaused = true;
      $('#pause-button').html("Play");
    }
    else {
      $('#pause-button').html("Pause");
      isPaused = false;
      draw();
    }
  });
mySwiper1.on('touchMove', function () {
    setVolume(mySwiper1.progress);
});
mySwiper2.on('touchMove', function () {
    setFrequency(mySwiper2.progress);
});
$('.mute-button').click((e)=> {
  if(mute){
    setVolume(mySwiper1.progress);
    $('.mute-button').html("Mute");
  } else {
    $('.mute-button').html("Play");
    gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
  }
  mute = !mute;


});

});

function setVolume(vol){
  var newVolume = logspace(0.001,0.1, vol, 2);
  console.log(newVolume);

  gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.5);
}

function setFrequency(freq){
  console.log(freq);
  var newFreq = logspace(50, 15000, freq,2);
  console.log(newFreq);
  osc.frequency.setTargetAtTime(newFreq, audioCtx.currentTime, 0.5);

}
function logScale(val, newFrom, newTo){
    var exp = Math.log2(newTo+1-newFrom)*val/newTo;
  return Math.pow(2, exp)-1+newFrom;
}
function logspace(start, stop, n, N){
    return start * Math.pow(stop/start, n/(N-1));
}
