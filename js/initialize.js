/* INCLUDED HERE:
    - Initialization of all the variables used in the program.
    - Calls the set up method
*/

/* Tasks:
    - 'Low pass filter' effect: instead of doing a real low pass filter, we will call one of the rampTo (linear, exponential, etc) functions for the frequency and volume, 
      and we will keep printing the circle according to the value of the frequency-volume in each moment in time.
    - Do the bounding in the graphs correctly: instead of the current result (commented in drawing.js), we should map the controls canvas and the drawing canvas so
      that the maximum in the controls will map to the highest point in the graph.
*/

/* Things to improve:
    - Making the site fully responsive (in the 1st load its responsive, we need to do so when resizing)
    - Improve the UI
    - Set a scale for drawing the axis in the right canvas, because now it prints more or less lines depending on the size of the page
    - Very slow on iPad and no sound
    - There is a bug when you touch really quickly with two fingers inside the controlsCanvas aera,
      just in the initial screen.
*/


const WAVECOLOR1 = 'rgb(246, 109, 244)'; // Light blue
const WAVECOLOR2 = 'rgb(66, 229, 244)'; // Violet
const WAVECOLOR3 = 'rgb(101, 255, 0)'; // Light green
const WAVECOLOR4 = 'rgb(255, 140, 0)'; // Orange
const WAVECOLOR5 = 'rgb(2, 10, 185)'; // Dark blue
const WAVECOLORTOTAL = 'rgb(255, 255, 0)'; // Yellow

// If we want the graph to have the effect that time passes
const AFFECTTIME = false;

// Minimum and maximum frequencies in the table
const MINFREQ = 20;
const MAXFREQ = 20000;

// Minimum and maximum volumes passed to Tone JS (dB)
const MINVOLUME = -50;
const MAXVOLUME = -1;

// Maximum number of fingers allowed in the system
const MAXFINGERS = 4;
const WAVESCOMPLEXMODE = 5;

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

function fixHeaderPosition() {
  // Instruction done in JS because css works incorrectly for iOS devices
  document.getElementById('waves-canvas').style.height = document.getElementById('graph-container').clientHeight + "px";
  document.getElementById('header-text').style.left = document.getElementById('waves-canvas').clientWidth / 2 - document.getElementById('header-text').clientWidth / 2 + 'px';
  document.getElementById('header-text').style.top = -document.getElementById('header-text').clientHeight * 1 / 3 + 'px';

  document.getElementById('yAxis-header').style.top = document.getElementById('waves-canvas').clientHeight / 2 - document.getElementById('yAxis-header').clientHeight / 2 + 'px';
}


function fixButtonHeaderPosition() {
  // Instruction done in JS because css works incorrectly for iOS devices
  let freeSpace = document.getElementById('button-container').clientWidth - 2 * document.getElementById('pure-button').clientWidth;

  document.getElementById('pure-header').style.width = document.getElementById('pure-button').clientWidth + 'px';
  document.getElementById('pure-header').style.right = document.getElementById('button-container').clientWidth - (freeSpace / 4) - document.getElementById('pure-button').clientWidth + 'px';
  document.getElementById('pure-header').style.bottom = -document.getElementById("button-container").clientHeight * 4 / 7 + 'px';

  document.getElementById('complex-header').style.width = document.getElementById('complex-button').clientWidth + 'px';
  document.getElementById('complex-header').style.right = document.getElementById('button-container').clientWidth - (3 * freeSpace / 4) - 2 * document.getElementById('pure-button').clientWidth + 'px';
  document.getElementById('complex-header').style.bottom = -document.getElementById("button-container").clientHeight * 4 / 7 + 'px';
}

function fixLeyendPosition() {
  // Instruction done in JS because css works incorrectly for iOS devices
  let offsetPureTones = 5;
  document.getElementById('pure-tones-text').style.bottom = document.getElementById('freq-info').clientHeight + offsetPureTones + 'px';
  document.getElementById('pure-tones-text').style.left = offsetPureTones + 'px';

  let leftOffsetLineCanvas = 10;
  let leftOffsetLeyendText = 5;
  let bottomOffsetLeyendText = 2;
  document.getElementById('line-canvas').style.height = document.getElementById('freq-info').clientHeight + 'px';
  document.getElementById('line-canvas').style.left = document.getElementById('freq-info').clientWidth + leftOffsetLineCanvas + 'px';

  document.getElementById('leyend-text').style.bottom = document.getElementById('line-canvas').clientHeight / 2 - document.getElementById('leyend-text').clientHeight / 2 - bottomOffsetLeyendText + 'px';
  document.getElementById('leyend-text').style.left = document.getElementById('freq-info').clientWidth + leftOffsetLineCanvas + document.getElementById('line-canvas').clientWidth + leftOffsetLeyendText + 'px';
}

// Function made to draw the leyend line representing the total waveform.
function drawLeyendLine() {
  let lineCanvasId = document.getElementById('line-canvas');
  let lineCanvas = createHiDPICanvas(lineCanvasId.clientWidth, lineCanvasId.clientHeight, 'line-canvas');
  let lineCanvasCtx = lineCanvas.getContext('2d');

  let lineWidth = 3.5;
  let lineHeightCut = 10;

  lineCanvasCtx.beginPath();
  lineCanvasCtx.strokeStyle = WAVECOLORTOTAL;
  lineCanvasCtx.lineWidth = lineWidth;
  lineCanvasCtx.globalAlpha = 1;
  lineCanvasCtx.moveTo(0, lineCanvasId.clientHeight / 2);
  lineCanvasCtx.lineTo(lineCanvasId.clientWidth, lineCanvasId.clientHeight / 2);
  lineCanvasCtx.stroke();
  lineCanvasCtx.closePath();
}

// Creates waves canvas with the device resolution and initialize the variables accordingly
function setUpWavesCanvas() {
  let wavesCanvasName = 'waves-canvas';
  let wavesCanvasId = document.getElementById(wavesCanvasName);
  wavesCanvas = createHiDPICanvas(wavesCanvasId.clientWidth, wavesCanvasId.clientHeight, wavesCanvasName);
  wavesCanvasCtx = wavesCanvas.getContext('2d');
}

// Creates controls canvas with the device resolution and initialize the variables accordingly
function setUpControlsCanvas() {
  let controlsCanvasName = 'controls-canvas';
  let controlsCanvasId = document.getElementById(controlsCanvasName);
  controlsCanvas = createHiDPICanvas(controlsCanvasId.clientWidth, controlsCanvasId.clientHeight, controlsCanvasName);
  controlsCanvasCtx = controlsCanvas.getContext('2d');
}


// This function creates a Canvas with a good quality, using the pixel ratio of the device.
var createHiDPICanvas = function (w, h, canvasName, ratio) {
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

// Mode: can be pure or complex
var mode = "pure";

// Waves canvas context, waves canvas element
var wavesCanvasCtx, wavesCanvas;

// Controls canvas context, controls canvas element
var controlsCanvasCtx, controlsCanvas;

// Boolean storing if the mouse is clicked or not
var mouseDown;

// Boolean to store if the mouse is moving or not
var mouseMove;

// Boolean to enable/disable the sustain audio mode
var isSustained = false;

// Object to store in the most recent frequency and amplitude and mousePos
var mostRecent = {
  pure: {
    mousePos: []
  },
  complex: {
    mousePos: []
  },
};

// Variable to keep track of the mouse/finger position
var mousePos = [];

// Variable to keep track of the frequency and volume
var frequency = [];
var amplitude = [];
// Variable to keep track of the old frequency and old volume
var oldFreq = [];
var oldVol = [];

// Variable to keep track of the fingers touching the screen (only in finger mode)
var touch = [];
// Number of fingers touching the screen
var nFingers;

// Calculate the length of the previous arrays
var lengthArrays;
if (MAXFINGERS > WAVESCOMPLEXMODE) {
  lengthArrays = MAXFINGERS;
} else {
  lengthArrays = WAVESCOMPLEXMODE;
}

var oscillators = [];

/*
  Variable to keep track of the first time that we are rendering a complex wave:
    - Used to calculate the reference point in order to draw the complex volumes correctly.
*/
var firstComplexRender = false;

// This is used to initialize the Audio Context when the user first interacts with the app. It is done by a third party library and used to match the current Audio Contex specifications.
StartAudioContext(Tone.context, 'body');

/* 
    Sets Tone JS:
      - We create several oscillators, which we attach to a lower volume.
      - We apply the limiter (compression) to this volume.
      - We connect these components to a higher volume, as a makeUpGain effect.
      - Finally, we connect this to the speakers, and we start the oscillators.
*/
function setUpToneJS() {
  let masterVolume = new Tone.Volume(-40);
  let makeUpGain = new Tone.Volume(15);
  let limiter = new Tone.Compressor({
    ratio: 20,
    threshold: -6
  });
  for (let i = 0; i < lengthArrays; i++) {
    oscillators[i] = new Tone.Oscillator({
      "type": "sine",
      "frequency": 1,
      "volume": 0
    }).connect(masterVolume);
  }
  masterVolume.connect(limiter);
  limiter.connect(makeUpGain);
  makeUpGain.toMaster();

  for (let w = 0; w < lengthArrays; w++) {
    oscillators[w].start();
  }
}

// Makes the signal generator layout visible and sets all the different components of the app.
function setUp() {
  document.getElementById("startText").style.visibility = "hidden";
  document.getElementById("container").style.visibility = "visible";

  fixHeaderPosition();
  fixButtonHeaderPosition();
  fixLeyendPosition();

  drawLeyendLine();

  setUpWavesCanvas();

  setUpControlsCanvas();

  setMouseListeners();
  setTouchListeners();


  setToZero();
  setUpToneJS();
}

// Function called only once at the beginning of the application, when the user first taps. It will set up the rest of the application.
var setUpCallback = function (e) {
  e.preventDefault();
  setUp();
  document.removeEventListener("mousedown", setUpCallback, false);
  document.removeEventListener("touchstart", setUpCallback, false);
}

// Set to change mode and colors when the user clicks in the 'pure' or 'complex' buttons.
document.addEventListener('DOMContentLoaded', function () {
  let colorGray = '#c1c5c9';
  let colorYellow = '#FFE900';

  document.getElementById("pure-button").onclick = function () {
    if (mode !== "pure") {
      mode = "pure";
      document.getElementById('pure-button').style.backgroundColor = colorYellow;
      document.getElementById('complex-button').style.backgroundColor = colorGray;
    }

    // If it is sustained, create a new pure wave with the most recent freq and amplitude of complex mode
    if (isSustained) {
      // First reset the amplitudes and frequency and the screen to clear out the current sound
      setToZero();
      releaseSynths(); 

      // Then take the frequency of the complex mode and generate a pure wave with it
      mousePos[0] = mostRecent.complex.mousePos[0];
      renderPureWavesCanvas("mousedown");
    }
  }

  document.getElementById("complex-button").onclick = function () {
    if (mode !== "complex") {
      mode = "complex";
      document.getElementById('complex-button').style.backgroundColor = colorYellow;
      document.getElementById('pure-button').style.backgroundColor = colorGray;
    }
    firstComplexRender = true;

    // If it is sustained, create a new complex wave with most recent freq and amplitude of pure mode
    if (isSustained) {
      // First reset the amplitudes and frequency and the screen to clear out the current sound
      setToZero();
      releaseSynths();

      // Then take the frequency of the pure mode and generate a complex wave with it
      mousePos[0] = mostRecent.pure.mousePos[0];
      renderComplexWavesCanvas("mousedown");
    }
  }

  let sustainNode = document.getElementById('sustain-checkbox');
  sustainNode.onclick = function () {
    if (sustainNode.checked) {
      isSustained = true;
    } else {
      isSustained = false;
      setToZero();              // Reset the picture to be drawn
      releaseSynths();          // release the synths used too
    }
  }

});

// This is set so that a context menu does not appear when the user double clicks.
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
