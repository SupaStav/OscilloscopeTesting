var analyser;
var animate;
fftSize = 2048;
var bufferLength = fftSize/2;
// var dataArray = new Float32Array(fftSize);
const SAMPLERATE = 44100;
var canvas = document.getElementById('my-canvas');
var canvasCtx = canvas.getContext('2d');
var isPaused = false;
var test1 = 0;

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

    window.onload =startRecord

    function startRecord() {
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


var dataArray = new Uint8Array(bufferLength);
      // let x = 0
      // let y = 10;
      // let width = WIDTH - x;
      // let height = HEIGHT - y;
      analyser.getByteTimeDomainData(dataArray);
if(test1<300){
  // console.log(dataArray);
  test1++;
}

      canvasCtx.fillStyle = 'rgb(0,0,0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

      canvasCtx.beginPath();

var sliceWidth = WIDTH * 1.0 / bufferLength;
      var x = 0;
      var paused = false;
      for(var i = 0; i < bufferLength; i++) {

              var v = dataArray[i] / 128;
              // if(v > 1.5){
                // paused =false;
                canvasCtx.strokeStyle = 'rgb(219, 4, 4)';
              // } else {
                // paused = true;
                // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
              // }
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

            canvasCtx.lineTo(canvas.width, canvas.height/2);
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

//Button Pauses
document.getElementById('button').onclick = function() {
   if(!isPaused) {
     isPaused = true;
   }
   else {
     isPaused = false;
     draw();
   }
};
