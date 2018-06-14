/* INCLUDED HERE:
    - Functions related to the complex waves feature.
*/


// It takes a random volume, applies the proportion to it, and inserts that volume in the corresponding index.
function calculateComplexVolume(proportion, index, randomInitialVolumes){
  let vol = randomInitialVolumes[index]/proportion;
  let newVolume = logspace(MINVOLUME, MAXVOLUME, vol, EXPONENTIAL_INC_FACTOR);
  oscillators[index].volume.value = newVolume;
  amplitude[index] = vol;
}

// It takes a frequency, applies a multiplier and copies it to the frequency with the given index
function calculateFrequencyMultiplier (freq, multiplier, index){
  frequency [index] = freq * multiplier;
  oscillators[index].frequency.value = frequency [index];
}

// Given the frequency and the volume previously calculated, we insert the corresponding mouse position (useful to draw the points in their corresponding places)
function calculateMousePos(canvas, index) {
  let rect = canvas.getBoundingClientRect();
  mousePos[index].y = ((inverseLogsPace(MINFREQ, MAXFREQ, frequency[index], EXPONENTIAL_INC_FACTOR)*(-1))+1)*rect.height;
  mousePos[index].x = amplitude[index]*rect.width;
}

// Inverse of logspace function (util.js): gets the mouse position from the frequencies and volumes
function inverseLogsPace(start, stop, freq, N){
  return (N-1)*Math.log(freq/start)/Math.log(stop/start);
}
