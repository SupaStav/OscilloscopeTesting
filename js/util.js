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
      if (newVolume>0){
        oscillators[index].volume.value = 0;
      } else {
        oscillators[index].volume.value = newVolume;
      }

      console.log("Volume number "+index+" is "+newVolume);
      
    }
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

function calculateRandomVolumes(){
  for (let h=1; h<WAVESCOMPLEXMODE; h++){
    randomInitialAmplitudes[h] = Math.random();
  }
};

/* Function used in the complex mode.
It calculates a random volume and applies it to the volume with the given index */

function calculateNewVolume(proportion, index){
  let vol = randomInitialAmplitudes[index]/proportion;

  let newVolume = -1*((1-vol)*volumePower);
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
    if (!startOscillators[index]){
      oscillators[index].start();
      startOscillators[index]=true;
    }
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
    oscillators[index].frequency.value = frequency [index];
  }
}

function calculateMousePos(index) {
  mousePos[index].y = ((inverseLogsPace(minFreq, maxFreq, frequency[index], 2)*(-1))+1)*DRAWHEIGHT;
  mousePos[index].x = amplitude[index]*DRAWWIDTH;

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

function deleteFinger (indexFinger){
  if (isSynths) {
    synths[indexFinger].triggerRelease();
    synths.splice(indexFinger, 1);
    let newSynth = new Tone.Synth(options).toMaster();
    synths.push(newSynth);
    //synths[lengthArrays-1].chain(masterVolume, Tone.Master);
  } else {
    for (let j=indexFinger; j<lengthArrays-1; j++){
      oscillators[j].frequency.rampTo(oscillators[j+1].frequency.value, 0.05);
      oscillators[j].volume.rampTo(oscillators[j+1].volume.value, 0.05);
    }
    oscillators[lengthArrays-1].frequency.rampTo(1, 0.1);
    oscillators[lengthArrays-1].volume.rampTo(-Infinity, 0.1);
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
    originalComplexAmplitude = 0;
  }
  pureOn = false;
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
        synths[j] = new Tone.Synth(options).toMaster();
        //synths[j].chain(masterVolume, Tone.Master);
      } else {
        oscillators[j].frequency.rampTo(1, 0.1);
        oscillators[j].volume.rampTo(-Infinity, 0.1);
        //oscillators[j].stop();
      }
    }
  }
}
