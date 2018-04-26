/* INCLUDED HERE:
    - Functions that are called as support for the correct running of other functions
      * Set the volume and frequency
      * Logspace
      * Get mouse position
      * Set to zero
*/

// Function that sets the volume to the value indicated as argument
function setVolume(vol, index) {
  //var newVolume = logspace(0.001, 0.5, vol, 2);
  newVolume = -1*((1-vol)*volumePower);
  //gain.gain.setTargetAtTime(newVolume, audioCtx.currentTime, 0.05);
  var redraw = false;
  if (Math.abs(vol - oldVol[index]) > changeSensitivity) {
    synths[index].volume.value = newVolume;
    //oscillators[index].volume.exponentialRampTo(newVolume, 0.002);
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

/* Function used in the complex mode.
It calculates a random volume and applies it to the volume with the given index */
function calculateRandomVolume (index) {
  var vol = Math.random();
  var newVolume = logspace(0.001, 0.5, vol, 2);
  synths[index].volume.value = newVolume;
  amplitude[index] = vol;
}

// Function that sets the frequency to the value indicated as argument
function setFrequency(freq, index) {
  var newFreq = logspace(minFreq, maxFreq, freq, 2);
  //osc.frequency.value = newFreq;
  frequency[index] = newFreq;
  var redraw = false;
  if (Math.abs(freq - oldFreq[index]) > changeSensitivity) {
    synths[index].frequency.value = newFreq;
    //oscillators[index].start();
    //oscillators[index].frequency.value = newFreq;
    oldFreq[index] = freq;
    redraw = true;
  }
  return redraw;
}
function startFrequency (freq, index){
  var newFreq = logspace(minFreq, maxFreq, freq, 2);
  synths[index].triggerAttack(newFreq);
}

/* Function used in the complex mode.
It takes a frequency, applies a multiplier and copies it to the frequency with the given index */
function calculateFrequencyMultiplier (freq, multiplier, index){
  frequency [index] = freq * multiplier;
  synths[index].triggerAttack(frequency [index]);
}

// Function used to translate our data into the frequencies and volume ranges we predefined
function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}


// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(); // abs. size of element
  return {
    x: (evt.clientX - rect.left), // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) // been adjusted to be relative to element
  }
}

/* The closest to a reset function. It reinitializes almost everything.
Used in the initialization and in the mouse up callback */
function setToZero(){
  mouseDown = false;
  mouseMove = false;
  nFingers = 0;
  touch = [];
  drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
  renderAxesLabels();
  mouseDown = false;
  mouseMove = false;
  for (var j=0; j<lengthArrays; j++){
    mousePos[j] = {
      x: 0,
      y: 0
    };
    oldFreq[j] = -1;
    oldVol[j] = -1;
    frequency[j] = 1;
    amplitude[j] = 0;
  }
  draw();
}

// Function used to release all the synths for our sound.
function releaseSynths(){
  if (!isStarted) {
    start();
  } else {
    for (var j=0; j<lengthArrays; j++){
      synths[j].triggerRelease();
      synths[j] = new Tone.Synth(options);
      synths[j].chain(masterVolume, Tone.Master);
      /*oscillators[0].stop();
      oscillators[0].frequency.value=1;
      oscillators[0].volume.value=0;*/
    }
  }
}
