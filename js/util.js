/* INCLUDED HERE:
    - Functions that are called as support for the correct running of other functions
      * Set the volume and frequency
      * Logspace
      * Get mouse position
      * Set to zero
*/

// Function that sets the volume to the value indicated as argument
function setVolume(vol, index) {
  newVolume = -1*((1-vol)*volumePower);
  let redraw = false;
  if (Math.abs(vol - oldVol[index]) > changeSensitivity) {
    if (isSynths) {
        synths[index].volume.value = newVolume;
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
function calculateRandomVolume (index) {
  let vol = Math.random();
  let newVolume = logspace(0.001, 0.5, vol, 2);
  if (isSynths) {
      synths[index].volume.value = newVolume;
  } else {
    oscillators[index].volume.value = newVolume;
  }
  amplitude[index] = vol;
}

// Function that sets the frequency to the value indicated as argument
function setFrequency(freq, index) {
  let newFreq = logspace(minFreq, maxFreq, freq, 2);
  frequency[index] = newFreq;
  let redraw = false;
  if (Math.abs(freq - oldFreq[index]) > changeSensitivity) {
    if (isSynths) {
      synths[index].frequency.value = newFreq;
    } else {
      oscillators[index].frequency.value = newFreq;
    }
    oldFreq[index] = freq;
    redraw = true;
  }
  return redraw;
}

function startFrequency (freq, index){
  let newFreq = logspace(minFreq, maxFreq, freq, 2);
  if (isSynths) {
    synths[index].triggerAttack(newFreq);
  } else {
    oscillators[index].start();
    oscillators[index].frequency.value = newFreq;
  }
}

/* Function used in the complex mode.
It takes a frequency, applies a multiplier and copies it to the frequency with the given index */
function calculateFrequencyMultiplier (freq, multiplier, index){
  frequency [index] = freq * multiplier;
  if (isSynths) {
    synths[index].triggerAttack(frequency [index]);
  } else {
    oscillators[index].start();
    oscillators[index].frequency.value = frequency [index];
  }
}

// Function used to translate our data into the frequencies and volume ranges we predefined
function logspace(start, stop, n, N) {
  return start * Math.pow(stop / start, n / (N - 1));
}


// Get the position of the mouse relative to the canvas
function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect(); // abs. size of element
  return {
    x: (evt.clientX - rect.left), // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) // been adjusted to be relative to element
  }
}

function deleteFinger (indexFinger){
  if (isSynths) {
    synths[indexFinger].triggerRelease();
    synths.splice(indexFinger, 1);
    synths.push(new Tone.Synth(options));
    synths[lengthArrays-1].chain(masterVolume, Tone.Master);
  } else {
    oscillators[indexFinger].stop();
    oscillators.splice(indexFinger, 1);
    oscillators.push(new Tone.Oscillator({
         "type" : "sine",
        "frequency" : 1,
        "volume" : 0
      }));
    oscillators[lengthArrays-1].toMaster();
  }

  auxTouch.splice(indexFinger, 1);
  mousePos.splice(indexFinger, 1);
  oldFreq.splice(indexFinger, 1);
  oldVol.splice(indexFinger, 1);
  frequency.splice(indexFinger, 1);
  amplitude.splice(indexFinger, 1);
  mousePos.push({x: 0, y: 0});
  oldFreq.push(-1);
  oldVol.push(-1);
  frequency.push(1);
  amplitude.push(0);
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
  draw();
}

// Function used to release all the synths for our sound.
function releaseSynths(){
  if (!isStarted) {
    start();
  } else {
    for (let j=0; j<lengthArrays; j++){
      if (isSynths){
        synths[j].triggerRelease();
        synths[j] = new Tone.Synth(options);
        synths[j].chain(masterVolume, Tone.Master);
      } else {
        oscillators[j].stop();
        oscillators[j].frequency.value=1;
        oscillators[j].volume.value=0;
      }
    }
  }
}
