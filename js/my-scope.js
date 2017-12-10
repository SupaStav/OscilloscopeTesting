var analyser;
var fftSize = 2048;
var dataLength = fftSize/2;
var dataArray = new Uint8Array(dataLength);
var ctxArray = [];
const SAMPLERATE = 44100;
// var canvas = document.getElementById('scope-1');
var isPaused = false;
var test1 = 0;
var WIDTH;
var HEIGHT;

function createCanvas(name, length, num){
  var canvas = document.getElementById(name);
  HEIGHT = canvas.height;
  WIDTH = canvas.width;
  var bufferSecs = length;
  var bufferSize = bufferSecs * SAMPLERATE;
  var process_buffer = new Uint8Array(bufferSize);
  var canvasCtx = canvas.getContext('2d');
  // console.log(canvasCtx.canvas.id);
  var sampling = 20 * length;
ctxArray.push({
    id:num,
    ctx: canvasCtx,
    sampling: sampling,
    process_buffer: process_buffer,
    bufferSize: bufferSize

  });

};

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
      dataLength = analyser.frequencyBinCount;
      // analyser.connect(audioCtx.destination);
      // analyser.getFloatTimeDomainData(dataArray);
// myOscilloscope = new WavyJones(audioCtx, 'oscilloscope');
// microphone.connect(myOscilloscope);
      getData();
      }, (err)=>{
      console.log("ERROR");
      });
      // draw();

    }

function getData(){
  analyser.getByteTimeDomainData(dataArray);
  var elem = ctxArray[0];
  // ctxArray.forEach((elem, index)=>{
    draw(elem.ctx, elem.sampling, elem.process_buffer, elem.bufferSize);
  // });
  window.requestAnimationFrame(getData);
}


function draw(canvasCtx, sampling, process_buffer, bufferSize){
//50 ms
//2.5s= 50x
//1/50th of canvas size

//While True
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = 'rgb(0,0,0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
  canvasCtx.beginPath();

      var num_samples = dataArray.length;
      var shiftIndex = (bufferSize-num_samples);
      //Shift
      process_buffer = process_buffer.map((val, index, arr)=>{
        // if(index > 109226){
        //   return dataArray[index - shiftIndex]
        // }
        // else {
        //   return arr[index + num_samples]
        // }
        // Shift buffer and append values
        // return Math.random()*15+120
        if(index > shiftIndex ){
          return dataArray[index - shiftIndex])
        }

        // return (index < shiftIndex) ? arr[index + num_samples] : dataArray[index - shiftIndex];
      });


if(test1==302||test1==305){
  console.log(process_buffer);
  test1++;
} else {
test1++;
}

var sliceWidth = WIDTH  / dataLength;

var x = 0;

      for(var i = 0; i < bufferSize; i=i+sampling) {
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
      canvasCtx.lineTo(WIDTH, HEIGHT/2);
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
