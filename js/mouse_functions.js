/* INCLUDED HERE:
    - Every function related handling a mouse event.
*/

// The first time we tap anywhere in the page, we will call setUp() and remove this listener.
document.addEventListener("mousedown", setUpCallback, false);

function setMouseListeners (){

  // Gets mouse position and calls to render canvas
  controlsCanvas.addEventListener("mousedown", function(e) {
    e.preventDefault();
    mouseDown = true;
    processMouseAction(e);
  }, false);

  // Gets mouse position and calls to render canvas
  document.addEventListener("mousemove", function(e) {
    e.preventDefault();
    mouseMove = true;
    if (mouseDown){
      processMouseAction(e);
    }
  }, false);

  function processMouseAction(e) {
    if (nFingers === 0){
      mousePos[0] = getMousePos(controlsCanvas, e);
      if (mode==="pure"){
        renderPureWavesCanvas();
      } else if (mode==="complex"){
        renderComplexWavesCanvas();
      }
    }
  }
  
  // We reset everything to their initial values
  document.addEventListener('mouseup', function() {
      setToZero();
      releaseSynths();
  });
}
