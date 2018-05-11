/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

// Whem the mouse is clicked, we will create a wave dependent on the mouse position
drawCanvas.addEventListener("mousedown", function(e) {
  //gain.gain.cancelScheduledValues(0);
  e.preventDefault();

  mouseDown = true;
  mouseMove = false;
  firstDown = true;

  if (!isStarted){
      isStarted = true;
      start();
  }

  if (nFingers === 0){
    mousePos[0] = getMousePos(drawCanvas, e);
    renderCanvas();
    firstDown = false;
  } else {
    mousePos[finger] = getMousePos(drawCanvas, e);
  }
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
      if (pureOn || mode==="pure"){
        setToZero();
        releaseSynths();
      }

  }
});
