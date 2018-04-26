/* INCLUDED HERE:
    - Every function related handling a touch event.
*/

// When the user touches the screen, we simulate a mouse click
drawCanvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  if (mode==="pure" || nFingers<=1){
    if (nFingers<MAXFINGERS){
      var mouseEvent;
      touch = e.touches;
      nFingers = touch.length;
      if (nFingers>MAXFINGERS){
        nFingers = MAXFINGERS;
      }
      for (var j=0; j<nFingers; j++){
        finger = j;
        mouseEvent = new MouseEvent("mousedown", {
          clientX: touch[j].clientX,
          clientY: touch[j].clientY
        });
        drawCanvas.dispatchEvent(mouseEvent);
      }
      renderCanvas();
      firstFrequency = false;
    }
  }
}, false);

// When the user stops touching the screen, we simulate a mouse unclick
drawCanvas.addEventListener("touchend", function(e) {
  e.preventDefault();
  if (mode==="pure"){
    var indexFingerUp;
    auxTouch = [];
    for (var z=0; z<touch.length; z++){
      auxTouch[z] = touch [z];
    }
    console.log('Length of touches leaving is '+e.changedTouches.length);
    for (var z=0; z<e.changedTouches.length; z++){
      for (var j=0; j<auxTouch.length; j++){
        if(auxTouch[j] && e.changedTouches[z]){
          if (auxTouch[j].clientX === e.changedTouches[z].clientX && auxTouch[j].clientY === e.changedTouches[z].clientY){
            indexFingerUp = j;
          }
        }
      }
      console.log('Before Releasing finger '+indexFingerUp);
      console.log('Fingers beforeReleasing = '+nFingers);
      if (indexFingerUp<MAXFINGERS && nFingers<=MAXFINGERS && indexFingerUp<nFingers){
        nFingers--;
        synths[indexFingerUp].triggerRelease();
        console.log('RELEASED!!');
        console.log('Fingers left = '+nFingers);
        console.log(' ');

        synths.splice(indexFingerUp, 1);
        synths.push(new Tone.Synth(options));
        synths[lengthArrays-1].chain(masterVolume, Tone.Master);
        /*oscillators[indexFingerUp].stop();
        oscillators.splice(indexFingerUp, 1);
        oscillators.push(new Tone.Oscillator({
             "type" : "sine",
       			"frequency" : 1,
       			"volume" : 0
       		}));
        oscillators[MAXFINGERS-1].toMaster();*/

        auxTouch.splice(indexFingerUp, 1);
        mousePos.splice(indexFingerUp, 1);
        oldFreq.splice(indexFingerUp, 1);
        oldVol.splice(indexFingerUp, 1);
        frequency.splice(indexFingerUp, 1);
        amplitude.splice(indexFingerUp, 1);
        mousePos.push({x: 0, y: 0});
        oldFreq.push(-1);
        oldVol.push(-1);
        frequency.push(1);
        amplitude.push(0);
      }
    }
    touch = auxTouch;
    console.log(touch);
    console.log('');
    console.log(' ');
    auxTouch = [];
    if (nFingers<=0){
      setToZero();
      releaseSynths()
    } else {
      draw();
    }
  } else {
    setToZero();
    releaseSynths();
  }
}, false);

// When the user moves its fingers in the screen, we simulate a mouse move
drawCanvas.addEventListener("touchmove", function(e) {
  e.preventDefault();
  if (mode==="pure" || nFingers<=1){
    if (nFingers<= MAXFINGERS){
      var mouseEvent;
      touch = e.touches;
      for (var j=0; j<touch.length; j++){
        finger = j;
        mouseEvent = new MouseEvent("mousedown", {
          clientX: touch[j].clientX,
          clientY: touch[j].clientY
        });
        drawCanvas.dispatchEvent(mouseEvent);
      }
      renderCanvas();
    }
  }
}, false);

drawCanvas.addEventListener("touchcancel", function(e) {
  console.log('AAAAAAAAAAAss');
  console.log('AAAAAAAAAAA');
  console.log('TOUCH CANCELLED');
  console.log('AAAAAAAAAAA');
  console.log('AAAAAAAAAAAss');
}, false);