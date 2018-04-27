/* INCLUDED HERE:
    - Every function related handling a touch event.
*/

// When the user touches the screen, we simulate a mouse click
drawCanvas.addEventListener("touchstart", function(e) {
  e.preventDefault();
  if ((mode==="pure" || nFingers<=1) && nFingers<MAXFINGERS){
    let mouseEvent;
    touch = e.touches;
    nFingers = touch.length;
    if (nFingers>MAXFINGERS){
      nFingers = MAXFINGERS;
    }
    for (let j=0; j<nFingers; j++){
      finger = j;
      mouseEvent = new MouseEvent("mousedown", {
        clientX: touch[j].clientX,
        clientY: touch[j].clientY
      });
      drawCanvas.dispatchEvent(mouseEvent);
    }
    renderCanvas();
    firstDown = false;
  }
}, false);

// When the user stops touching the screen, we simulate a mouse unclick
drawCanvas.addEventListener("touchend", function(e) {
  e.preventDefault();
  if (mode==="pure"){
    let indexFingerUp;
    auxTouch = [];
    for (let z=0; z<touch.length; z++){
      auxTouch[z] = touch [z];
    }
    console.log('Length of touches leaving is '+e.changedTouches.length);
    for (let z=0; z<e.changedTouches.length; z++){
      for (let j=0; j<auxTouch.length; j++){
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

        console.log('RELEASED!!');
        console.log('Fingers left = '+nFingers);
        console.log(' ');

        deleteFinger (indexFingerUp);
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
      let mouseEvent;
      touch = e.touches;
      for (let j=0; j<touch.length; j++){
        finger = j;
        mouseEvent = new MouseEvent("mousemove", {
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
