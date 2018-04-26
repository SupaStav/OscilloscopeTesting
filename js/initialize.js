/* INCLUDED HERE:
    - Initialization of all the variables used in the program.
    - Calls the set up method
*/


/* Things to improve:
    - Making the site fully responsive (in the 1st load its responsive, we need to do so when resizing)
    - Set a scale for drawing the axis in the right canvas, because now it prints more or less axes depending on the size of the page
    - When moving the cursor too fast outside the left canvas, the blue dot gets blocked
*/

/* To do:
    - (semidone) Think of a possible design for data representation. x-axis : time, y-axis: voltage sent to the speaker
    - (matthew solving it) Very slow on iPad and no sound
    - Maybe fix position of pure tone and complex tune
    - Touchend is not firing sometimes, leaving one wave on screen
    - Otro problema: Cuando spameas el touch muchas veces, el sonido acaba por desaparecer o sufrir interferencias (la pag se bugea)
*/

// Setting the audio API and connecting all of its components.

var mode = "pure";
/*var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var osc = audioCtx.createOscillator();
var gain = audioCtx.createGain();
osc.connect(gain);
gain.gain.setValueAtTime(0, audioCtx.currentTime);
osc.type = type;
osc.start();
gain.connect(audioCtx.destination);
graphGain = audioCtx.createGain();
graphGain.gain.setValueAtTime(10, audioCtx.currentTime);
gain.connect(graphGain);
graphGain.connect(analyser);
*/

// Positionate the y axes header in the correct position
document.getElementById('yAxis-header').style.top = document.getElementById('scope-1').clientHeight-document.getElementById('yAxis-header').clientHeight+'px';
document.getElementById('header-text').style.left = document.getElementById('scope-1').clientWidth/2-document.getElementById('header-text').clientWidth/2+'px';
document.getElementById('header-text').style.bottom = document.getElementById('scope-1').clientHeight-document.getElementById('header-text').clientHeight/2+'px';
/* From the previous version


var pureLocation = document.getElementById('pure-button').getBoundingClientRect();
var complexLocation = document.getElementById('complex-button').getBoundingClientRect();
document.getElementById('pure-header').style.left = pureLocation.left+pureLocation.width/5+'px';
document.getElementById('pure-header').style.top = pureLocation.top+pureLocation.height-10+'px';
document.getElementById('complex-header').style.left = complexLocation.left+'px';
document.getElementById('complex-header').style.top = complexLocation.top+complexLocation.height-10+'px';

*/

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
/*var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);*/

// Minimum and maximum frequencies in the table
var minFreq = 20;
var maxFreq = 20000;
// How sensitive is the program with the movement of the mouse/finger
// If very sensitive, it will be updated at the minimum change. If not sensitive, it will take longer to update.
var changeSensitivity = 0.0015;

// Decrease the value to Increase the volume
var volumePower = 40;
var firstFrequency = false;

// Number of points in the graph and distance between points (only for sine version)
var numberPoints = 2048*16;
var sliceWidth = WIDTH / numberPoints;
// Time variable (only for sine version)
var t=0;
var affectTime = false;

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
// Maximum number of fingers allowed in the system
var MAXFINGERS = 4;
var WAVESCOMPLEXMODE = 5;
var lengthArrays;
if (MAXFINGERS>WAVESCOMPLEXMODE){
  lengthArrays = MAXFINGERS;
} else {
  lengthArrays = WAVESCOMPLEXMODE;
}
// Variable to traverse the fingers in different methods
var finger;

var isStarted = false;

var options = {
 oscillator  : {
   type  : "sine"
 },
};


var oscillators;
var synths;
var masterVolume;

function start(){

  Tone.context = new(window.AudioContext || window.webkitAudioContext)();
  //oscillators = new Array(MAXFINGERS);
  synths = new Array(lengthArrays);
  masterVolume = new Tone.Volume(0);
  for(let i=0; i<lengthArrays; i++){
   synths[i] = new Tone.Synth(options);
   synths[i].chain(masterVolume, Tone.Master);
   /*oscillators[i] = new Tone.Oscillator({
        "type" : "sine",
  			"frequency" : 1,
  			"volume" : 0
  		}).toMaster();*/
  }
}

// This function will set up the two canvas that we are using in the application
function setUp() {

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

  //Create draw canvas with the device resolution.
  drawCanvasId = document.getElementById('draw-canvas');
  DRAWHEIGHT = drawCanvasId.clientHeight;
  DRAWWIDTH = drawCanvasId.clientWidth;
  drawCanvas = createHiDPICanvas(DRAWWIDTH, DRAWHEIGHT, 'draw-canvas');
  drawCanvasCtx = drawCanvas.getContext('2d');

  setToZero();
}

// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {
  // Alternative to jQuery click function
  document.getElementById("pure-button").onclick = function () {
    if (mode!=="pure"){
      mode = "pure";
      document.getElementById('pure-button').style.backgroundColor = '#FFE900';
      document.getElementById('complex-button').style.backgroundColor = '#c1c5c9';
    }
  }

  document.getElementById("complex-button").onclick = function () {
    if (mode!=="complex"){
      mode = "complex";
      document.getElementById('complex-button').style.backgroundColor = '#FFE900';
      document.getElementById('pure-button').style.backgroundColor = '#c1c5c9';
    }
  }
});




// We initially set both canvas
setUp();
