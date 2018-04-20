/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

// Whem the mouse is clicked, we will create a wave dependent on the mouse position
drawCanvas.addEventListener("mousedown", function(e) {
  //gain.gain.cancelScheduledValues(0);
  e.preventDefault();
  mouseDown = true;
  mouseMove = false;
  firstFrequency = true;
  if (!isStarted){
      isStarted = true;
      start();
  }

  if (nFingers === 0){
    mousePos[0] = getMousePos(drawCanvas, e);
    renderCanvas();
    firstFrequency = false;
  } else {
    mousePos[finger] = getMousePos(drawCanvas, e);
  }

  /*if(osc == null){
    osc = audioCtx.createOscillator();
    osc.type = type;
    osc.start();
    osc.connect(gain);
  }*/
}, false);

// When the mouse moves, we keep track of its position.
drawCanvas.addEventListener("mousemove", function(e) {
  e.preventDefault();
  mouseMove = true;

  if (nFingers === 0){
    mousePos[0] = getMousePos(drawCanvas, e);
    renderCanvas();
  } else {
    mousePos[finger] = getMousePos(drawCanvas, e);
  }
}, false);

// Alternative to jQuery ready function. Supported everywhere but IE 8 (too old, it should not be a problem)
document.addEventListener('DOMContentLoaded', function() {
  // Alternative to jQuery mouseup function
  document.onmouseup = function(){
      setToZero();
      releaseSynths();
  }
});
