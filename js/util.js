/* INCLUDED HERE:
    - Functions that are called as support for the correct running of other functions
      * Set the volume and frequency
      * Logspace
      * Get mouse position
      * Set to zero and release synths
*/

// Used for the logspace calculation.
const EXPONENTIAL_INC_FACTOR = 2;

// How sensitive is the program with the movement of the mouse/finger
// If very sensitive, it will be updated at the minimum change. If not sensitive, it will take longer to update.
const CHANGE_SENSITIVITY_FACTOR = 0.0015;


// Function that sets the volume to the corresponding index. Returns false if the change is not enough to redraw the graph.
function setVolume(vol, index) {
  let newVolume = logspace(MINVOLUME, MAXVOLUME, vol, EXPONENTIAL_INC_FACTOR);
  let redraw = false;
  if (Math.abs(vol - oldVol[index]) > CHANGE_SENSITIVITY_FACTOR) {
    if (newVolume>0){
      oscillators[index].volume.value = 0;
    } else {
      oscillators[index].volume.exponentialRampToValueAtTime(newVolume, Tone.context._context.currentTime + 0.01);
    }
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

// Function that sets the frequency to the corresponding index. Returns false if the change is not enough to redraw the graph.
function setFrequency(freq, index) {
  let newFreq = logspace(MINFREQ, MAXFREQ, freq, EXPONENTIAL_INC_FACTOR);
  frequency[index] = newFreq;
  let redraw = false;
  if (Math.abs(freq - oldFreq[index]) > CHANGE_SENSITIVITY_FACTOR) {
    oscillators[index].frequency.exponentialRampToValueAtTime(newFreq,Tone.context._context.currentTime + 0.01 );
    oldFreq[index] = freq;
    redraw = true;
  }
  return redraw;
}

// Function used to translate the mouse position into the frequency and volume ranges we predefined
function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}

// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  if (mouseDown){
    let rect = canvas.getBoundingClientRect(); // abs. size of element
    var toReturnX = (evt.clientX - rect.left);
    var toReturnY = (evt.clientY - rect.top);

    // We check if the mouse is outside the canvas and we do not let that happen.
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
      x: toReturnX,
      y: toReturnY
    }
  }
}

// Resets variables to their default value, and redraws both canvas (to their originals). 
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
