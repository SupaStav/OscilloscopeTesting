function createCanvas(name, size){
var analyser;
var animate;
fftSize = 2048;
var bufferLength = fftSize/2;
var dataArray = new Uint8Array(bufferLength);
var bufferArray = new Uint8Array(bufferLength*10);
const SAMPLERATE = 44100;
var canvas = document.getElementById(name);
var canvasCtx = canvas.getContext('2d');
var isPaused = false;
var test1 = 0;
var k=0;
var Xzoom = 1;
var Yzoom=1;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

    // window.onload =startRecord
    startRecord();
    function startRecord() {
      console.log("created "+name);
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!window.AudioContext) {
        console.log("No window.AudioContext");
        return; // no audio available
      }
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!navigator.getUserMedia) {
        console.log("No navigator.getUserMedia");
        return; // no audio available
      }

      let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      let stream;
      // let inputStream = audioCtx.createScriptProcessor(1024, 1, 1);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;
      // inputStream.onaudioprocess = processAudio;

      navigator.getUserMedia({audio: true}, (stream)=> {

      var microphone = audioCtx.createMediaStreamSource(stream);
      // inputStream.connect(analyser);
      microphone.connect(analyser);
      bufferLength = analyser.frequencyBinCount;
      // analyser.connect(audioCtx.destination);
      // analyser.getFloatTimeDomainData(dataArray);

      }, (err)=>{
      console.log("ERROR");
      });
      draw();

    }
function draw(){
//50 ms
//2.5s= 50x
//1/50th of canvas size

// Control Spectrogram onset/offset of notes, make ramps

if(!isPaused){
  animate = window.requestAnimationFrame(draw);

}

  // animate = window.requestAnimationFrame(draw);


  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = 'rgb(0,0,0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
  canvasCtx.beginPath();






      // let x = 0
      // let y = 10;
      // let width = WIDTH - x;
      // let height = HEIGHT - y;
      analyser.getByteTimeDomainData(dataArray);
if(test1<300){
  // console.log(dataArray);
  test1++;
}

if(name==="scope-1"){
  for(var j=0; j<bufferLength; j++){
    bufferArray[j+k*bufferLength] = dataArray[j];
  }
  var sliceWidth = WIDTH / bufferLength/(k+1);


    var x = WIDTH/(k+1);

  var l = bufferLength*10;

}

  else {
    var sliceWidth = WIDTH / bufferLength;
    var x=0;
    var l = bufferLength;
  }


      var paused = false;

      for(var i = 0; i < l; i++) {

              if(name==="scope-1"){
                var v = bufferArray[i+k*bufferLength] / 128;
              } else {
                var v = dataArray[i] / 128;

              }
              // if(v > 1.5){
                // paused =false;
                canvasCtx.strokeStyle = 'rgb(219, 4, 4)';
              // } else {
                // paused = true;
                // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
              // }
              // v = (v-1)*Yzoom+1;
              var y = v * HEIGHT/2;


              // if(!paused){
              if(i === 0) {
                canvasCtx.moveTo(x, y);
              } else {

                canvasCtx.lineTo(x, y);

              }
              x += sliceWidth;
            // }
          }
          k=(k+1)%10;

            // canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();


  // var step = width / dataArray.length;
  // canvasCtx.beginPath();
  // // drawing loop (skipping every second record)
  // for (var i = 0; i < dataArray.length; i++) {
  //   var percent = [i] / dataArray.length;
  //   var x1 = x + (i * step);
  //   var y1 = y + (i * percent);
  //   canvasCtx.lineTo(x1, y1);
  // }
  //
  // canvasCtx.stroke();

};

$( document ).ready(()=>{
  //Button Pauses
  $('#button').click (()=> {
    if(!isPaused) {
      isPaused = true;
      console.log(dataArray);
    }
    else {
      isPaused = false;
      draw();
    }
  });

  $('#XzoomIn').click(()=>{
    Xzoom*=1.25;
  });

  $('#XzoomOut').click(()=>{
    Xzoom/=1.25;

  });

  $('#YzoomIn').click(()=>{
    Yzoom*=1.25;
  });

  $('#YzoomOut').click(()=>{
    Yzoom/=1.25;

  });

});
}
