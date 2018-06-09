/* INCLUDED HERE:
    - Functions that are called as support for the correct running of other functions
      * Set the volume and frequency
      * Logspace
      * Get mouse position
      * Set to zero
*/

const EXPONENTIAL_INC_FACTOR = 2;
// How sensitive is the program with the movement of the mouse/finger
// If very sensitive, it will be updated at the minimum change. If not sensitive, it will take longer to update.
const CHANGE_SENSITIVITY_FACTOR = 0.0015;
// Decrease the value to Increase the volume
const VOLUMEPOWER = 40;


// Function that sets the volume to the value indicated as argument
function setVolume(vol, index) {
  //let newVolume = -1*((1-vol)*VOLUMEPOWER);
  let newVolume = logspace(MINVOLUME, MAXVOLUME, vol, EXPONENTIAL_INC_FACTOR);
  let redraw = false;
  if (Math.abs(vol - oldVol[index]) > CHANGE_SENSITIVITY_FACTOR) {
    if (newVolume>0){
      oscillators[index].volume.value = 0;
    } else {
      oscillators[index].volume.value = newVolume;
    }
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

/* Function used in the complex mode.
It calculates a random volume and applies it to the volume with the given index */

function calculateComplexVolume(proportion, index, randomInitialVolumes){
  let vol = randomInitialVolumes[index]/proportion;

  let newVolume = logspace(MINVOLUME, MAXVOLUME, vol, EXPONENTIAL_INC_FACTOR);
  //let newVolume = -1*((1-vol)*VOLUMEPOWER);

  oscillators[index].volume.value = newVolume;

  amplitude[index] = vol;
}

// Function that sets the frequency to the value indicated as argument
function setFrequency(freq, index) {
  let newFreq = logspace(MINFREQ, MAXFREQ, freq, EXPONENTIAL_INC_FACTOR);
  frequency[index] = newFreq;
  let redraw = false;
  if (Math.abs(freq - oldFreq[index]) > CHANGE_SENSITIVITY_FACTOR) {
    oscillators[index].frequency.value = newFreq;
    oldFreq[index] = freq;
    redraw = true;
  }
  return redraw;
}

/* Function used in the complex mode.
It takes a frequency, applies a multiplier and copies it to the frequency with the given index */
function calculateFrequencyMultiplier (freq, multiplier, index){
  frequency [index] = freq * multiplier;
  oscillators[index].frequency.value = frequency [index];
}

function calculateMousePos(canvas, index) {
  let rect = canvas.getBoundingClientRect();
  mousePos[index].y = ((inverseLogsPace(MINFREQ, MAXFREQ, frequency[index], EXPONENTIAL_INC_FACTOR)*(-1))+1)*rect.height;
  mousePos[index].x = amplitude[index]*rect.width;
}

// Function used to translate our data into the frequencies and volume ranges we predefined
function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}

function inverseLogsPace(start, stop, freq, N){
  return (N-1)*Math.log(freq/start)/Math.log(stop/start);
}

// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  if (mouseDown){
    let rect = canvas.getBoundingClientRect(); // abs. size of element
    var toReturnX = (evt.clientX - rect.left);
    var toReturnY = (evt.clientY - rect.top);

    if (toReturnX < 0){
      toReturnX = 0;
    } else if (toReturnX > rect.width){
      toReturnX = rect.width;
    }
    if (toReturnY < 0){
      toReturnY = 0;
    } else if (toReturnY > rect.height){
      toReturnY = rect.height;
    }
    return {
      x: toReturnX, // scale mouse coordinates after they have
      y: toReturnY // been adjusted to be relative to element
    }
  }
}

/* The closest to a reset function. It reinitializes almost everything.
Used in the initialization and in the mouse up callback */
function setToZero(){
  mouseDown = false;
  nFingers = 0;
  touch = [];
  for (let j=0; j<lengthArrays; j++){
    mousePos[j] = {
      x: 0,
      y: 0
    };
    oldFreq[j] = -1;
    oldVol[j] = -1;
    frequency[j] = 1;
    amplitude[j] = 0;
  }
  drawAxesLabelsControlsCanvas(controlsCanvas, controlsCanvasCtx);
  drawPureWavesCanvas();
}

// Function used to release all the synths for our sound.
function releaseSynths(){
  for (let j=0; j<lengthArrays; j++){
    oscillators[j].frequency.rampTo(1, 0.1);
    oscillators[j].volume.rampTo(-Infinity, 0.1);
  }
}
