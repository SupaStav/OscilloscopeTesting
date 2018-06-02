/* INCLUDED HERE:
    - Functions that are called as support for the correct running of other functions
      * Set the volume and frequency
      * Logspace
      * Get mouse position
      * Set to zero
*/

function calculateMaximumPureSingleWave(sliceWidth){
  let max=0;
  let x=0;
  // For each of the points that we have
  for (let i = 0; i < numberPoints; i++) {
    let y=0;
    // Calculate the location of the point using the equation of the wave.
    let wavelength = 100 * HEIGHT / frequency[0];
    let v = wavelength/frequency[0];
    let k = 2*Math.PI/wavelength;
    if (amplitude[0]<0){
      y += (0 * 350 * Math.cos(k*(x+v*t)));
    } else {
      y += (amplitude[0]* 350 * Math.cos(k*(x+v*t)));
    }
    y += HEIGHT/2;

    if (max<y) max=y;

    // x moves the x-distance to the right
    x += sliceWidth;
  }
  return max;
}

function calculateProportionWave(max){
  if (max<HEIGHT){
    return 1;
  } else {
    return HEIGHT/max;
  }
}

// Function that sets the volume to the value indicated as argument
function setVolume(vol, index) {
  //let newVolume = -1*((1-vol)*volumePower);
  let newVolume = logspace(-50, -1, vol, 2);
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

    }
    oldVol[index] = vol;
    redraw = true;
  }
  amplitude[index] = vol;
  return redraw;
}

function calculateRandomVolumes(){
  for (let h=1; h<WAVESCOMPLEXMODE; h++){
    randomInitialAmplitudes[h] = Math.random()*amplitude[0];
  }
};

/* Function used in the complex mode.
It calculates a random volume and applies it to the volume with the given index */

function calculateNewVolume(proportion, index){
  let vol = randomInitialAmplitudes[index]/proportion;

  let newVolume = logspace(-50, -1, vol, 2);
  //let newVolume = -1*((1-vol)*volumePower);
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
function getMousePos(canvas, evt, index) {
  if (mouseDown){
    let rect = canvas.getBoundingClientRect(); // abs. size of element

    let prevX = previouseMousePos[index].x;
    let prevY = previouseMousePos[index].y;

    let currentX = (evt.clientX - rect.left);
    let currentY = (evt.clientY - rect.top);

    realMousePos[index].x = currentX;
    realMousePos[index].y = currentY;

    let toReturnX;
    let toReturnY;
    if (prevX===-1 && prevY===-1){
      toReturnX = currentX;
      toReturnY = currentY;
    } else {
      toReturnX = 0.92*(prevX-currentX)+currentX;
      toReturnY = 0.92*(prevY-currentY)+currentY;
    }

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

    previouseMousePos[index].x = toReturnX;
    previouseMousePos[index].y = toReturnY;

    return {
      x: toReturnX, // scale mouse coordinates after they have
      y: toReturnY // been adjusted to be relative to element
    }
  }
}

/*
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
}*/

function deleteFinger (indexFinger){
  if (isSynths) {
    synths[indexFinger].triggerRelease();
    synths[indexFinger].disconnect(masterVolume);
    synths.splice(indexFinger, 1);
    let newSynth = new Tone.Synth(options);
    synths.push(newSynth);
    synths[lengthArrays-1].connect(masterVolume);
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
  for (let j=0; j<lengthArrays; j++){
    mousePos[j] = {
      x: 0,
      y: 0
    };
    previouseMousePos[j] = {
      x: -1,
      y: -1
    };
    realMousePos[j] = {
      x: -1,
      y: -1
    };
    oldFreq[j] = -1;
    oldVol[j] = -1;
    frequency[j] = 1;
    amplitude[j] = 0;
  }
  pureOn = false;
  drawCanvasCtx.clearRect(0, 0, DRAWWIDTH, DRAWHEIGHT);
  renderAxesLabels();
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
      } else {
        oscillators[j].frequency.rampTo(1, 0.1);
        oscillators[j].volume.rampTo(-Infinity, 0.1);
        //oscillators[j].stop();
      }
    }
  }
}
