/* INCLUDED HERE:
    - Initialization of all the variables used in the program.
    - Calls the set up method
*/


/* Things to improve:
    - Making the site fully responsive (in the 1st load its responsive, we need to do so when resizing)
    - Set a scale for drawing the axis in the right canvas, because now it prints more or less axes depending on the size of the page
*/

/* To do:
    - (matthew solving it) Very slow on iPad and no sound
    - Saturation problems (several)
        * When you go out of the canvas with mouse, it starts saturating
        * Saturation with several Fingers
        * Saturation with complex waves
        * Several more...
*/


const WAVECOLOR1 = 'rgb(246, 109, 244)'; // Light blue
const WAVECOLOR2 = 'rgb(66, 229, 244)'; // Violet
const WAVECOLOR3 = 'rgb(101, 255, 0)'; // Light green
const WAVECOLOR4 = 'rgb(255, 140, 0)'; // Orange
const WAVECOLOR5 = 'rgb(2, 10, 185)'; // Dark blue
const WAVECOLORTOTAL = 'rgb(255, 255, 0)'; // Yellow


// Function that calculates the pixel ratio of the device
const PIXEL_RATIO = (function () {
    let ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

function fixHeaderPosition () {
  // Instruction done in JS because css works incorrectly for iOS devices
  document.getElementById('scope-1').style.height = document.getElementById('scope-container').clientHeight+"px";
  document.getElementById('header-text').style.left = document.getElementById('scope-1').clientWidth/2-document.getElementById('header-text').clientWidth/2+'px';
  document.getElementById('header-text').style.top = -document.getElementById('header-text').clientHeight*1/3+'px';

  document.getElementById('yAxis-header').style.top = document.getElementById('scope-1').clientHeight/2-document.getElementById('yAxis-header').clientHeight/2+'px';
}


function fixButtonHeaderPosition (){
  // Instruction done in JS because css works incorrectly for iOS devices
  let freeSpace = document.getElementById('button-container').clientWidth-2*document.getElementById('pure-button').clientWidth;

  document.getElementById('pure-header').style.width = document.getElementById('pure-button').clientWidth+'px';
  document.getElementById('pure-header').style.right = document.getElementById('button-container').clientWidth-(freeSpace/4)-document.getElementById('pure-button').clientWidth+'px';
  document.getElementById('pure-header').style.bottom = -document.getElementById("button-container").clientHeight*4/7+'px';

  document.getElementById('complex-header').style.width = document.getElementById('complex-button').clientWidth+'px';
  document.getElementById('complex-header').style.right = document.getElementById('button-container').clientWidth-(3*freeSpace/4)-2*document.getElementById('pure-button').clientWidth+'px';
  document.getElementById('complex-header').style.bottom = -document.getElementById("button-container").clientHeight*4/7+'px';
}

function fixLeyendPosition () {
  // Instruction done in JS because css works incorrectly for iOS devices
  let offsetPureTones = 5;
  document.getElementById('pure-tones-text').style.bottom = document.getElementById('freq-info').clientHeight+offsetPureTones+'px';
  document.getElementById('pure-tones-text').style.left = offsetPureTones+'px';

  let leftOffsetLineCanvas = 10;
  document.getElementById('line-canvas').style.height = document.getElementById('freq-info').clientHeight+'px';
  document.getElementById('line-canvas').style.left = document.getElementById('freq-info').clientWidth+leftOffsetLineCanvas+'px';

  document.getElementById('leyend-text').style.bottom = document.getElementById('line-canvas').clientHeight/2-document.getElementById('leyend-text').clientHeight/2+'px';
  document.getElementById('leyend-text').style.left = document.getElementById('freq-info').clientWidth+leftOffsetLineCanvas+document.getElementById('line-canvas').clientWidth+'px';
}

function drawLeyendLine(){
  let lineCanvasId = document.getElementById('line-canvas');
  let lineCanvas = createHiDPICanvas(lineCanvasId.clientWidth, lineCanvasId.clientHeight, 'line-canvas');
  let lineCanvasCtx = lineCanvas.getContext('2d');

  let lineWidth = 3.5;
  let lineHeightCut = 10;

  lineCanvasCtx.beginPath();
  lineCanvasCtx.strokeStyle = WAVECOLORTOTAL;
  lineCanvasCtx.lineWidth = lineWidth;
  lineCanvasCtx.globalAlpha = 1;
  lineCanvasCtx.moveTo(lineCanvasId.clientWidth/2, lineHeightCut-2);
  lineCanvasCtx.lineTo(lineCanvasId.clientWidth/2, lineCanvasId.clientHeight-lineHeightCut);
  lineCanvasCtx.stroke();
  lineCanvasCtx.closePath();
}

function setUpScope (){
  //Create scope canvas with the device resolution and initialize the variables accordingly
  let scopeId = document.getElementById('scope-1');
  HEIGHT = scopeId.clientHeight;
  WIDTH = scopeId.clientWidth;
  scope = createHiDPICanvas(WIDTH, HEIGHT, 'scope-1');
  scopeCtx = scope.getContext('2d');
}

function setUpDrawCanvas (){
  //Create draw canvas with the device resolution.
  let drawCanvasId = document.getElementById('draw-canvas');
  DRAWHEIGHT = drawCanvasId.clientHeight;
  DRAWWIDTH = drawCanvasId.clientWidth;
  drawCanvas = createHiDPICanvas(DRAWWIDTH, DRAWHEIGHT, 'draw-canvas');
  drawCanvasCtx = drawCanvas.getContext('2d');
}


// This function creates a Canvas with a good quality, using the pixel ratio of the device.
createHiDPICanvas = function(w, h, canvasName, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    // We create a canvas with the pixel ratio, in order to get the maximum quality
    let can = document.getElementById(canvasName);
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

var firstTouchEver;


var drawTimeStamp;

var mode = "pure";
var isSynths = false;

// Scope canvas context, id of the scope canvas, the element itself
var scopeCtx, scope;
// Width and height of the scope canvas element
var WIDTH, HEIGHT;

// Boolean storing if the mouse is clicked or not
var mouseDown;
// Boolean storing if the mouse is moving or not
var mouseMove;
var timeSinceLastMove;
var timeSinceLastCall;
var setIntervalId;

// Draw canvas context, id of the draw canvas, the element itself
var drawCanvasCtx, drawCanvas;
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
var firstDown = false;

// Number of points in the graph and distance between points (only for sine version)
var numberPoints = 2048*16;
var sliceWidth = WIDTH / numberPoints;
// Time variable (only for sine version)
var t=0;
var affectTime = false;

// Variable to keep track of the mouse/finger position (array done for each of the possible fingers)
var mousePos = [];
var previouseMousePos = [];
var realMousePos = [];

// Variable to keep track of the old frequency and old volume (array done for each of the possible fingers)
var oldFreq = [];
var oldVol = [];
// Variable to keep track of the frequency and volume (array done for each of the possible fingers)
var frequency=[];
var amplitude=[];
var randomInitialAmplitudes=[];
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
var startOscillators = [];

var oscillators;
var synths;
var limiter;

var pureOn = false;
var firstComplex = false;
var originalComplexAmplitude;

var options = {
 oscillator  : {
   type  : "sine"
 },
 envelope  : {
   attack  : 0.005,
   decay  : 0,
   sustain  : 1,
   release  : 0.01,
   attackCurve  : "linear",
   releaseCurve  : "exponential"
  }
};
var masterVolume;
var makeUpGain;


function initiallizePage(){
  firstTouchEver = false;

  for (let j=0; j<lengthArrays; j++){
      startOscillators [j] = false;
  }
}

function start(){

  if (isSynths) {
    synths = new Array(lengthArrays);
  } else {
    oscillators = new Array(lengthArrays);
  }
  masterVolume = new Tone.Volume(-40);
  makeUpGain = new Tone.Volume(15);
  limiter = new Tone.Compressor({
    ratio : 20,
    threshold: -6
  });
  for(let i=0; i<lengthArrays; i++){
    if (isSynths) {
      synths[i] = new Tone.Synth(options);
      synths[i].connect(masterVolume);
      //synths[i].chain(masterVolume, Tone.Master);
    } else {
      oscillators[i] = new Tone.Oscillator({
           "type" : "sine",
     			"frequency" : 1,
     			"volume" : 0
     		}).connect(masterVolume);
        // oscillators[i] = new Tone.Oscillator({
        //      "type" : "sine",
       	// 		"frequency" : 1,
       	// 		"volume" : 0
       	// 	}).toMaster();
    }
  }
   masterVolume.connect(limiter);
   limiter.connect(makeUpGain);
   makeUpGain.toMaster();

  StartAudioContext(Tone.context, 'body').then(function(){
    firstDown = true;
    renderCanvas();
    firstDown = false;
  })
}

// This function will set up the two canvas that we are using in the application
function setUp() {
  document.getElementById("container").style.visibility = "visible";
  document.getElementById("startText").style.visibility = "hidden";

  fixHeaderPosition();
  fixButtonHeaderPosition();
  fixLeyendPosition();

  drawLeyendLine();

  setUpScope();

  setUpDrawCanvas();

  setMouseListeners();
  setTouchListeners();

  setToZero();
}

// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {
  // Alternative to jQuery click function
  let colorGray = '#c1c5c9';
  let colorYellow = '#FFE900';

  document.getElementById("pure-button").onclick = function () {
    if (mode!=="pure"){
      mode = "pure";
      document.getElementById('pure-button').style.backgroundColor = colorYellow;
      document.getElementById('complex-button').style.backgroundColor = colorGray;
    }
  }

  document.getElementById("complex-button").onclick = function () {
    if (mode!=="complex"){
      mode = "complex";
      document.getElementById('complex-button').style.backgroundColor = colorYellow;
      document.getElementById('pure-button').style.backgroundColor = colorGray;
    }
    firstComplex = true;
  }

});

document.addEventListener("contextmenu", function(e){
  e.preventDefault();
});

// We initially set both canvas
initiallizePage();
