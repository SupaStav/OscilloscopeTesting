/* INCLUDED HERE:
    - Every function related handling a touch event.
*/

document.addEventListener("touchstart", setUpCallback, false);

function setTouchListeners (){

  // When the user touches the screen, we simulate a mouse click
  controlsCanvas.addEventListener("touchstart", function(e) {
    e.preventDefault();
    if (nFingers<MAXFINGERS){
      let mouseEvent;
      touch = e.touches;
      nFingers = touch.length;
      if (mode==="pure"){
        handleTouchStartPureWaves();
      } else if (mode==="complex"){
        handleTouchStartComplexWaves();
      }
    }
  }, false);

  function handleTouchStartPureWaves (){
    for (let j=0; j<touch.length; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousedown", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      controlsCanvas.dispatchEvent(mouseEvent);
    }
    renderPureWavesCanvas();
  }

  function handleTouchStartComplexWaves (){
    for (let j=0; j<1; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousedown", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      controlsCanvas.dispatchEvent(mouseEvent);
    }
    renderComplexWavesCanvas();
  }

  // When the user moves its fingers in the screen, we simulate a mouse move
  controlsCanvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    if (nFingers<= MAXFINGERS){
        let mouseEvent;
        touch = e.touches;
        if (mode==="pure"){
          handleTouchMovePureWaves();
        } else if (mode==="complex"){
          handleTouchMoveComplexWaves();
        }
    }
  }, false);

  function handleTouchMovePureWaves (){
    for (let j=0; j<touch.length; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousemove", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      document.dispatchEvent(mouseEvent);
    }
    renderPureWavesCanvas();
  }

  function handleTouchMoveComplexWaves (){
    for (let j=0; j<1; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousemove", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      document.dispatchEvent(mouseEvent);
    }
    renderComplexWavesCanvas();
  }

  // When the user stops touching the screen, we simulate a mouse unclick
  controlsCanvas.addEventListener("touchend", function(e) {
    e.preventDefault();
    if (mode==="pure"){
      let indexFingerUp;
      auxTouch = [];
      for (let z=0; z<touch.length; z++){
        auxTouch[z] = touch [z];
      }
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
      if (nFingers<=0){
        setToZero();
        releaseSynths();
      } else {
        renderPureWavesCanvas();
      }
    } else if (mode==="complex"){
      if(touch[0] && e.changedTouches[0]){
        if (touch[0].clientX === e.changedTouches[0].clientX && touch[0].clientY === e.changedTouches[0].clientY){
          setToZero();
          releaseSynths();
        }
      }
    }
  }, false);

  function deleteFinger (indexFinger){

    for (let j=indexFinger; j<lengthArrays-1; j++){
      oscillators[j].frequency.rampTo(oscillators[j+1].frequency.value, 0.05);
      oscillators[j].volume.rampTo(oscillators[j+1].volume.value, 0.05);
    }
    oscillators[lengthArrays-1].frequency.rampTo(1, 0.1);
    oscillators[lengthArrays-1].volume.rampTo(-Infinity, 0.1);

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
}
