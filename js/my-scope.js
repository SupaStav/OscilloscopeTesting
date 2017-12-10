var analyser;
var animate;
fftSize = 2048;
var dataLength = fftSize/2;
var dataArray = new Uint8Array(dataLength);
const SAMPLERATE = 44100;
const bufferSecs = 0.5;
const bufferSize = bufferSecs * SAMPLERATE;
var process_buffer = new Uint8Array(bufferSize);



var canvas = document.getElementById('my-canvas');
var canvasCtx = canvas.getContext('2d');
var isPaused = false;
var test1 = 0;
var k=0;
var Xzoom = 1;
var Yzoom=1;

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
      dataLength = analyser.frequencyBinCount;
      // analyser.connect(audioCtx.destination);
      // analyser.getFloatTimeDomainData(dataArray);
// myOscilloscope = new WavyJones(audioCtx, 'oscilloscope');
// microphone.connect(myOscilloscope);
      }, (err)=>{
      console.log("ERROR");
      });
      draw();

    }
function draw(){
//50 ms
//2.5s= 50x
//1/50th of canvas size

//While True
if(!isPaused){
  animate = window.requestAnimationFrame(draw);

}



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
      var num_samples = dataArray.length;
      //Shift
      process_buffer = process_buffer.map((val, index, arr)=>{
// Shift buffer and append values
        return (index < (bufferSize - num_samples)) ? arr[index + num_samples] : dataArray[index - (bufferSize-num_samples)];

      });






if(test1==300||test1==301){
  console.log(process_buffer);
  test1++;
} else {

test1++;
}

var sliceWidth = WIDTH  / dataLength;

var x = 0;

      var paused = false;
      for(var i = 0; i < bufferSize; i=i+10) {

              var v = process_buffer[i] / 128;
              // if(v > 1.5){
                // paused =false;
                canvasCtx.strokeStyle = 'rgb(219, 4, 4)';
              // } else {
                // paused = true;
                // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
              // }
              // v = (v-1)*Yzoom+1;
              var y = v * HEIGHT/2;


              if(i === 0) {
                canvasCtx.moveTo(x, y);
              } else {

                canvasCtx.lineTo(x, y);

              }
              x += sliceWidth;
          }

      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
};

$( document ).ready(()=>{
  //Button Pauses
  $('#button').click (()=> {
    if(!isPaused) {
      isPaused = true;
      console.log(process_buffer);
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
