/* INCLUDED HERE:
    - Every function related handling a touch event.
*/

var auxTouch;

// The first time we tap anywhere in the page, we will call setUp() and remove this listener.
document.addEventListener("touchstart", setUpCallback, false);

function setTouchListeners (){

  // We copy the e.touches object (contains info of each touch) into 'touch'. Later, we store the mouse positions for each of the fingers, and render canvas.
  // If we are in complex mode, we only take care
  controlsCanvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (nFingers<MAXFINGERS){
      mouseDown = true;
      processTouchAction(e, "touchstart");      // Send in that this event is for touch start
    }
  }, false);


  // We copy the e.touches object (contains info of each touch) into 'touch'. Later, we store the mouse positions for each of the fingers, and render canvas.
  controlsCanvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (nFingers<= MAXFINGERS){
      processTouchAction(e, "touchmove");
    }
  }, false);

  function processTouchAction(e, callFrom) {
    touch = e.touches;
    nFingers = touch.length;
    if (mode==="pure"){
      for (let j=0; j<touch.length; j++){
        mousePos[j] = getMousePos(controlsCanvas, {
          clientX: touch[j].clientX,
          clientY: touch[j].clientY
        });
      }
      renderPureWavesCanvas(callFrom);
    } else if (mode==="complex"){
      mousePos[0] = getMousePos(controlsCanvas, {
        clientX: touch[0].clientX,
        clientY: touch[0].clientY
      });
      renderComplexWavesCanvas(callFrom);
    }
  }

  // NOTE: I believe that this function can be refactored, but you have to be careful as a subtle change can break this.
  // Basic idea: traverse the list of fingers up, and eliminate those from our 'touch' object.
  controlsCanvas.addEventListener("touchend", function(e) {
    e.preventDefault();
    if (mode==="pure"){
      let indexFingerUp;
      // We create this auxTouch array and equal it to the touch TouchList object. Now we can perform the operations in the array as usual.
      // NOTE: I think that this could be done directly with touch, without the need of auxTouch. Just for you to try.
      auxTouch = [];
      for (let z=0; z<touch.length; z++){
        auxTouch[z] = touch [z];
      }
      
      // For each of the fingers up (e.changedTouches object) we will traverse the auxTouch array.
      // If there is a match, we will store that index, and if it is valid, we will delete such finger from our list.
      for (let z=0; z<e.changedTouches.length; z++){
        for (let j=0; j<auxTouch.length; j++){
          if(auxTouch[j] && e.changedTouches[z]){
            if (auxTouch[j].clientX === e.changedTouches[z].clientX && auxTouch[j].clientY === e.changedTouches[z].clientY){
              indexFingerUp = j;
            }
          }
        }
        if (indexFingerUp<MAXFINGERS && nFingers<=MAXFINGERS && indexFingerUp<nFingers){
          nFingers--;
          deleteFinger (indexFingerUp);
        }
      }
      touch = auxTouch;
      // If there are no more fingers in screen, set values to default. If not, render the new canvas.
      if (nFingers<=0){
        setToZero();
        releaseSynths();
      } else {
        renderPureWavesCanvas();
      }
    } else if (mode==="complex"){
      /*
	 If the mode is complex, we will just check that the finger that went up is the one that is plotting the complex wave.
	 If so, we will reset the variables. If not, we will not do anything (not an important finger).
      */
      if(touch[0] && e.changedTouches[0]){
        if (touch[0].clientX === e.changedTouches[0].clientX && touch[0].clientY === e.changedTouches[0].clientY){
          setToZero();
          releaseSynths();
        }
      }
    }
  }, false);

  /* 
    When deleting a finger, what we will do is shifting all the array positions one position to the left from the index we deleted.
    After this, we will insert a default value into the last position of each array.
    -  We do this shifting as a necessity: if we decrease the number of fingers touching the screen, we need that all those fingers are represented
       in the first values of the arrays. If not, when traversing through the number of fingers, there will be some values that we would never reach.
  */
  function deleteFinger (indexFinger){
    
    // Shifting the oscillators: each oscillator will take the frequency and volume from the oscillator from the right. Last oscillator will have default values.
    for (let j=indexFinger; j<lengthArrays-1; j++){
      oscillators[j].frequency.rampTo(oscillators[j+1].frequency.value, 0.05);
      oscillators[j].volume.rampTo(oscillators[j+1].volume.value, 0.05);
    }
    oscillators[lengthArrays-1].frequency.rampTo(1, 0.1);
    oscillators[lengthArrays-1].volume.rampTo(-Infinity, 0.1);
    
    // We just splice this auxTouch, to dont have a match in the next iteration to eliminate a finger.
    auxTouch.splice(indexFinger, 1);

    // Shifting other arrays: we call splice in the index and later push a default value.
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
}
