var analyser;
var fftSize = 8192;
var dataLength = fftSize/2;
var dataArray = new Uint8Array(dataLength);
var ctxArray = [];
const SAMPLERATE = 44100;
// var canvas = document.getElementById('scope-1');
var isPaused = false;
var test1 = 0;
var WIDTH;
var HEIGHT;
var process_buffer;
var bufferSize;
var start;

var canvas1 = document.getElementById('scope-1');
var canvas2 = document.getElementById('scope-2');
var canvas3 = document.getElementById('scope-3');
  HEIGHT = canvas1.height;
  WIDTH = canvas1.width;
  var canvasCtx1 = canvas1.getContext('2d');
  var canvasCtx2 = canvas2.getContext('2d');
  var canvasCtx3 = canvas3.getContext('2d');

  // console.log(canvasCtx.canvas.id);
  var bufferSecs = 50;
  var sampling = 20 * bufferSecs;
  bufferSize = bufferSecs * dataLength;
  // bufferSize = dataLength*5;
  process_buffer = new Uint8Array(bufferSize);

// ctxArray.push({
//     id:num,
//     ctx: canvasCtx,
//     sampling: sampling,
//     process_buffer: process_buffer,
//     bufferSize: bufferSize
//
//   });

// };

    window.onload =startRecord
    // startRecord();
    function startRecord() {
      console.log("created ");
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
start = new Date().getTime();
getData();

      }, (err)=>{
      console.log("ERROR");
      });
      // draw();

    }


function getData(){
if(!isPaused){
  analyser.getByteTimeDomainData(dataArray);

  var end = new Date().getTime();
  var time = end - start;
  // start = end;
  console.log(time);

  // var elem = ctxArray[0];

        var num_samples = dataArray.length;
        var shiftIndex = bufferSize-num_samples;
        //Shift
        process_buffer = process_buffer.map((val, index, arr)=>{


          // return Math.random()*15+120

          // Shift buffer and append values

          if(index <= shiftIndex ){
            return arr[index + num_samples];
          } else {//if(index > shiftIndex) {
            return dataArray[index - shiftIndex];
          }// else {
          //   return arr[index+num_samples-1];
          // }

          // return (index < shiftIndex) ? arr[index + num_samples] : dataArray[index - shiftIndex];
        });

        if(test1==302||test1==305){
          console.log(process_buffer);
          process_buffer.forEach((val, index)=>{
            if(val==0)console.log(index);
          });
          test1++;
        } else {
        test1++;
        }

  draw(canvasCtx1, 50);
  draw(canvasCtx2, 2.5);
  draw(canvasCtx3, 0.5);

    window.requestAnimationFrame(getData);
  }

}


function draw(canvasCtx, length){

    // window.requestAnimationFrame(draw.bind(canvasCtx, sampling, process_buffer, bufferSize));
//50 ms
//2.5s= 50x
//1/50th of canvas size
  // analyser.getByteTimeDomainData(dataArray);
//While True
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = 'rgb(0,0,0)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(255, 255, 255)';
  canvasCtx.beginPath();

var cutLength = bufferSecs-length;
var startPos = cutLength * dataLength;

var sliceWidth = WIDTH  / (bufferSize/(1/(length/bufferSecs)));
// sampling = 20 * length;

var x = 0;
      for(var i = 0; i < bufferSize-startPos; i++) {
              var v = process_buffer[i+startPos] / 128;

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
          // canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

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
      getData();
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
